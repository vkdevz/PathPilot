import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.skill import Skill
from app.models.career import Career
from app.repositories.semantic_retrieval_repository import SemanticRetrievalRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.services.embedding.provider_factory import get_embedding_provider
from app.services.embedding.embedding_pipeline import EmbeddingPipelineService
from app.services.embedding.retrieval_evaluation import RetrievalEvaluator

logger = logging.getLogger("pathpilot.service.retrieval")

class RetrievalService:
    """
    Unified high-level service orchestrating semantic search, embedding generation,
    and IR evaluation across all PathPilot entities.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.retrieval_repo = SemanticRetrievalRepository(session)
        self.emb_repo = EmbeddingRepository(session)
        self.pipeline_service = EmbeddingPipelineService(session)
        self.provider = get_embedding_provider()

    async def search_resources(
        self,
        query: str,
        resource_types: Optional[List[str]] = None,
        difficulties: Optional[List[str]] = None,
        skill_ids: Optional[List[str]] = None,
        max_minutes: Optional[int] = None,
        min_similarity: float = 0.0,
        provider: Optional[str] = None,
        is_interactive: Optional[bool] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Embeds user query and searches learning resources with structured filters.
        """
        query_vector = await self.provider.embed_text(query)
        results = await self.retrieval_repo.search_resources(
            query_vector=query_vector,
            resource_types=resource_types,
            difficulties=difficulties,
            skill_ids=skill_ids,
            max_minutes=max_minutes,
            min_similarity=min_similarity,
            provider=provider,
            is_interactive=is_interactive,
            limit=limit
        )

        # Format items with explainable match attributes
        formatted = []
        for item in results:
            r = item["resource"]
            sim_score = item["similarity_score"]
            percentage = round(sim_score * 100, 1)

            # Match tier
            if sim_score >= 0.8:
                match_tier = "Direct Match"
            elif sim_score >= 0.6:
                match_tier = "High Relevance"
            elif sim_score >= 0.4:
                match_tier = "Moderate Relevance"
            else:
                match_tier = "Exploratory Match"

            reasons = [
                f"Semantic similarity score: {percentage}%",
                f"Difficulty aligns with {r.difficulty} level",
                f"Covers key skills: {', '.join(item['skills_taught']) if item['skills_taught'] else 'General'}"
            ]

            formatted.append({
                "id": r.id,
                "slug": r.slug,
                "title": r.title,
                "description": r.description,
                "resource_type": r.resource_type,
                "url": r.url,
                "difficulty": r.difficulty,
                "estimated_minutes": r.estimated_minutes,
                "provider": r.provider,
                "is_interactive": r.is_interactive,
                "skills_taught": item["skills_taught"],
                "similarity_score": sim_score,
                "relevance_percentage": percentage,
                "match_tier": match_tier,
                "reasons": reasons
            })

        return formatted

    async def search_skills(
        self,
        query: str,
        categories: Optional[List[str]] = None,
        difficulties: Optional[List[str]] = None,
        min_level: Optional[int] = None,
        max_level: Optional[int] = None,
        min_similarity: float = 0.0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Embeds user query and searches skills taxonomy.
        """
        query_vector = await self.provider.embed_text(query)
        results = await self.retrieval_repo.search_skills(
            query_vector=query_vector,
            categories=categories,
            difficulties=difficulties,
            min_level=min_level,
            max_level=max_level,
            min_similarity=min_similarity,
            limit=limit
        )

        formatted = []
        for item in results:
            sk = item["skill"]
            sim_score = item["similarity_score"]
            formatted.append({
                "id": sk.id,
                "slug": sk.slug,
                "name": sk.name,
                "category": sk.category,
                "difficulty": sk.difficulty,
                "level": sk.level,
                "estimated_minutes": sk.estimated_minutes,
                "description": sk.description,
                "similarity_score": sim_score,
                "relevance_percentage": round(sim_score * 100, 1)
            })

        return formatted

    async def search_careers(
        self,
        query: str,
        categories: Optional[List[str]] = None,
        min_demand: Optional[int] = None,
        min_similarity: float = 0.0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Embeds user query and searches career roles.
        """
        query_vector = await self.provider.embed_text(query)
        results = await self.retrieval_repo.search_careers(
            query_vector=query_vector,
            categories=categories,
            min_demand=min_demand,
            min_similarity=min_similarity,
            limit=limit
        )

        formatted = []
        for item in results:
            c = item["career"]
            sim_score = item["similarity_score"]
            formatted.append({
                "id": c.id,
                "slug": c.slug,
                "name": c.name,
                "category": c.category,
                "icon": c.icon,
                "market_demand_score": c.market_demand_score,
                "salary_range": c.salary_range,
                "description": c.description,
                "similarity_score": sim_score,
                "relevance_percentage": round(sim_score * 100, 1)
            })

        return formatted

    async def find_resources_by_skill(
        self,
        skill_identifier: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Finds learning resources semantically matched to a skill's embedding representation.
        """
        # Look up skill by slug or ID
        stmt = select(Skill).where(
            (Skill.slug == skill_identifier) | (Skill.id == skill_identifier)
        )
        res = await self.session.execute(stmt)
        skill = res.scalar_one_or_none()

        if not skill:
            return []

        # Check if skill has an embedding
        emb = await self.emb_repo.get_by_entity("skill", skill.id)
        if emb and emb.embedding:
            query_vector = emb.embedding
        else:
            query_vector = await self.provider.embed_text(f"{skill.name} {skill.category} {skill.description}")

        results = await self.retrieval_repo.search_resources(
            query_vector=query_vector,
            limit=limit
        )

        formatted = []
        for item in results:
            r = item["resource"]
            formatted.append({
                "id": r.id,
                "slug": r.slug,
                "title": r.title,
                "resource_type": r.resource_type,
                "difficulty": r.difficulty,
                "estimated_minutes": r.estimated_minutes,
                "provider": r.provider,
                "similarity_score": item["similarity_score"],
                "target_skill_slug": skill.slug,
                "target_skill_name": skill.name
            })
        return formatted

    async def get_index_stats(self) -> Dict[str, Any]:
        """Returns embedding index statistics."""
        return await self.emb_repo.get_stats()

    async def trigger_reindex(self, force: bool = False) -> Dict[str, Any]:
        """Runs the batch embedding generation pipeline."""
        return await self.pipeline_service.generate_all(force=force)

    async def evaluate(self, k: int = 5) -> Dict[str, Any]:
        """Runs IR benchmark evaluation."""
        evaluator = RetrievalEvaluator(self.session)
        return await evaluator.evaluate_suite(k=k)
