import pytest
import numpy as np
from app.services.embedding.deterministic_provider import DeterministicEmbeddingProvider
from app.services.embedding.openai_provider import OpenAIEmbeddingProvider
from app.services.embedding.gemini_provider import GeminiEmbeddingProvider
from app.services.embedding.provider_factory import get_embedding_provider

@pytest.mark.asyncio
async def test_deterministic_provider_dimensions_and_norm():
    provider = DeterministicEmbeddingProvider(dimension=1536)
    assert provider.dimension == 1536
    assert provider.model_name == "deterministic-v1"

    text = "FastAPI backend development with PostgreSQL and asyncpg"
    vec = await provider.embed_text(text)

    assert len(vec) == 1536
    assert isinstance(vec[0], float)

    # Verify L2 Unit Normalization (norm == 1.0)
    norm = np.linalg.norm(np.array(vec))
    assert abs(norm - 1.0) < 1e-4

@pytest.mark.asyncio
async def test_deterministic_provider_reproducibility():
    provider = DeterministicEmbeddingProvider(dimension=1536)
    text = "Machine Learning foundations with Scikit-Learn and Pandas"

    vec1 = await provider.embed_text(text)
    vec2 = await provider.embed_text(text)

    assert vec1 == vec2

@pytest.mark.asyncio
async def test_deterministic_semantic_clustering():
    provider = DeterministicEmbeddingProvider(dimension=1536)

    # Embed three texts: two data science/Python texts, one unrelated frontend text
    ds_text_1 = "Python for Data Science, statistics, and machine learning models"
    ds_text_2 = "Hands-on machine learning with Scikit-learn and deep learning in Python"
    fe_text = "Frontend user interface design with React, Tailwind CSS, and HTML"

    vec_ds1 = np.array(await provider.embed_text(ds_text_1))
    vec_ds2 = np.array(await provider.embed_text(ds_text_2))
    vec_fe = np.array(await provider.embed_text(fe_text))

    # Dot product of unit vectors equals cosine similarity
    sim_ds_ds = float(np.dot(vec_ds1, vec_ds2))
    sim_ds_fe = float(np.dot(vec_ds1, vec_fe))

    # Verify semantically related texts have strictly higher similarity than unrelated
    assert sim_ds_ds > sim_ds_fe
    assert sim_ds_ds > 0.40
    assert sim_ds_fe < 0.35

@pytest.mark.asyncio
async def test_batch_embedding_generation():
    provider = DeterministicEmbeddingProvider(dimension=1536)
    texts = [
        "Cloud DevOps with Terraform and AWS",
        "Kubernetes container orchestration",
        "Cybersecurity penetration testing and ethical hacking"
    ]

    batch = await provider.embed_batch(texts)
    assert len(batch) == 3
    for v in batch:
        assert len(v) == 1536
        assert abs(np.linalg.norm(v) - 1.0) < 1e-4

@pytest.mark.asyncio
async def test_provider_factory_fallback():
    provider = get_embedding_provider(force_new=True)
    assert provider is not None
    assert provider.dimension == 1536

    vec = await provider.embed_text("Test query")
    assert len(vec) == 1536
