import logging
import httpx
from typing import List
from app.services.embedding.base import BaseEmbeddingProvider
from app.services.embedding.deterministic_provider import DeterministicEmbeddingProvider

logger = logging.getLogger("pathpilot.embedding.openai")

class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    """
    OpenAI embedding provider using the /v1/embeddings endpoint.
    Supports text-embedding-3-small (1536 dim) and text-embedding-3-large.
    """

    def __init__(self, api_key: str, model_name: str = "text-embedding-3-small", dimension: int = 1536):
        self._api_key = api_key
        self._model_name = model_name
        self._dim = dimension
        self._fallback_provider = DeterministicEmbeddingProvider(dimension=dimension)

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return self._model_name

    async def embed_text(self, text: str) -> List[float]:
        results = await self.embed_batch([text])
        return results[0]

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # Sanitize texts (replace newlines)
        clean_texts = [t.replace("\n", " ").strip() or "empty" for t in texts]

        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._model_name,
            "input": clean_texts,
            "dimensions": self._dim,
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    sorted_data = sorted(data["data"], key=lambda x: x["index"])
                    return [item["embedding"] for item in sorted_data]
                else:
                    logger.warning(f"OpenAI embedding API returned status {response.status_code}: {response.text}")
                    return await self._fallback_provider.embed_batch(texts)
        except Exception as e:
            logger.warning(f"OpenAI embedding call failed ({e}), falling back to deterministic provider")
            return await self._fallback_provider.embed_batch(texts)
