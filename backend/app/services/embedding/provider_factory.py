import logging
from typing import Optional
from app.core.config import settings
from app.services.embedding.base import BaseEmbeddingProvider
from app.services.embedding.openai_provider import OpenAIEmbeddingProvider
from app.services.embedding.gemini_provider import GeminiEmbeddingProvider
from app.services.embedding.deterministic_provider import DeterministicEmbeddingProvider

logger = logging.getLogger("pathpilot.embedding.factory")

_cached_provider: Optional[BaseEmbeddingProvider] = None

def get_embedding_provider(force_new: bool = False) -> BaseEmbeddingProvider:
    """
    Factory that instantiates and returns the appropriate embedding provider
    based on environment configuration and available API credentials.
    """
    global _cached_provider
    if _cached_provider is not None and not force_new:
        return _cached_provider

    openai_key = settings.OPENAI_API_KEY
    gemini_key = settings.GEMINI_API_KEY

    if openai_key and openai_key not in ("mock-key", "test-key", ""):
        logger.info("Initializing OpenAI Embedding Provider (text-embedding-3-small, 1536 dim)")
        provider = OpenAIEmbeddingProvider(
            api_key=openai_key,
            model_name=settings.EMBEDDING_MODEL,
            dimension=1536
        )
    elif gemini_key and gemini_key not in ("mock-key", "test-key", ""):
        logger.info("Initializing Google Gemini Embedding Provider (text-embedding-004, 1536 dim)")
        provider = GeminiEmbeddingProvider(
            api_key=gemini_key,
            model_name="text-embedding-004",
            dimension=1536
        )
    else:
        logger.info("Initializing Deterministic Semantic Embedding Provider (1536 dim, zero network dependency)")
        provider = DeterministicEmbeddingProvider(dimension=1536, model_name="deterministic-v1")

    _cached_provider = provider
    return provider
