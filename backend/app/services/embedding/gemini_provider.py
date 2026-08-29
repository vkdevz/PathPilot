import logging
import httpx
import numpy as np
from typing import List
from app.services.embedding.base import BaseEmbeddingProvider
from app.services.embedding.deterministic_provider import DeterministicEmbeddingProvider

logger = logging.getLogger("pathpilot.embedding.gemini")

class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """
    Google Gemini Embedding Provider using text-embedding-004.
    Projects 768-dim embeddings to 1536-dim or zero-pads with normalization.
    """

    def __init__(self, api_key: str, model_name: str = "text-embedding-004", dimension: int = 1536):
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

    def _normalize_and_pad(self, vec: List[float]) -> List[float]:
        arr = np.array(vec, dtype=np.float64)
        if len(arr) < self._dim:
            padded = np.zeros(self._dim, dtype=np.float64)
            padded[:len(arr)] = arr
            arr = padded
        elif len(arr) > self._dim:
            arr = arr[:self._dim]
        
        norm = np.linalg.norm(arr)
        if norm > 1e-12:
            arr = arr / norm
        return [round(float(x), 6) for x in arr]

    async def embed_text(self, text: str) -> List[float]:
        results = await self.embed_batch([text])
        return results[0]

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model_name}:batchEmbedContents?key={self._api_key}"
        requests = [
            {"model": f"models/{self._model_name}", "content": {"parts": [{"text": t}]}}
            for t in texts
        ]

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, json={"requests": requests})
                if response.status_code == 200:
                    data = response.json()
                    embeddings = [
                        self._normalize_and_pad(item["values"])
                        for item in data.get("embeddings", [])
                    ]
                    return embeddings
                else:
                    logger.warning(f"Gemini embedding API returned status {response.status_code}: {response.text}")
                    return await self._fallback_provider.embed_batch(texts)
        except Exception as e:
            logger.warning(f"Gemini embedding call failed ({e}), falling back to deterministic provider")
            return await self._fallback_provider.embed_batch(texts)
