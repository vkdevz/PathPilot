from abc import ABC, abstractmethod
from typing import List

class BaseEmbeddingProvider(ABC):
    """
    Abstract Base Class for all embedding generation providers.
    Enforces unified asynchronous interface and deterministic dimensionality.
    """

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Returns the dimensionality of the generated vectors (default 1536)."""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Returns the model identifier string."""
        pass

    @abstractmethod
    async def embed_text(self, text: str) -> List[float]:
        """
        Generates an embedding vector for a single string input.
        Returns a normalized list of floats.
        """
        pass

    @abstractmethod
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embedding vectors for a batch of strings.
        Returns a list of normalized float vectors.
        """
        pass
