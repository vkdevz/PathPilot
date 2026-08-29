import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.resource import Resource
from app.models.skill import Skill
from app.models.career import Career
from app.models.embedding import Embedding
from app.services.embedding.text_preprocessor import TextPreprocessor
from app.services.embedding.embedding_pipeline import EmbeddingPipelineService
from app.repositories.embedding_repository import EmbeddingRepository

@pytest.mark.asyncio
async def test_text_preprocessor_formatting(db_session: AsyncSession):
    stmt = select(Resource).where(Resource.slug == "res-python-mastery")
    res = await db_session.execute(stmt)
    resource = res.scalar_one()

    text = TextPreprocessor.prepare_resource_text(resource)
    assert "Python for Data Science & AI Mastery" in text
    assert "Difficulty: Beginner" in text

    h1 = TextPreprocessor.compute_hash(text)
    h2 = TextPreprocessor.compute_hash(text)
    assert h1 == h2
    assert len(h1) == 64

@pytest.mark.asyncio
async def test_embedding_pipeline_batch_generation(db_session: AsyncSession):
    pipeline = EmbeddingPipelineService(db_session)
    emb_repo = EmbeddingRepository(db_session)

    # Initial generation
    result = await pipeline.generate_all(force=True)
    assert result["status"] == "completed"
    assert result["total_upserted"] > 0

    stats = await emb_repo.get_stats()
    assert stats["total_embeddings"] > 0
    assert "resource" in stats["entity_breakdown"]
    assert "skill" in stats["entity_breakdown"]
    assert "career" in stats["entity_breakdown"]

@pytest.mark.asyncio
async def test_embedding_pipeline_idempotent_caching(db_session: AsyncSession):
    pipeline = EmbeddingPipelineService(db_session)

    # Run 1: generate all
    run1 = await pipeline.generate_all(force=False)
    
    # Run 2: without force, everything should be skipped / cached
    run2 = await pipeline.generate_all(force=False)
    assert run2["total_upserted"] == 0
    assert run2["total_skipped"] == run1["total_processed"]
