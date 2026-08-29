import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from app.models.resource import Resource, ResourceSkill
from app.models.skill import Skill
from app.models.career import Career, CareerSkill
from app.repositories.embedding_repository import EmbeddingRepository

logger = logging.getLogger("pathpilot.repository.semantic_retrieval")

class SemanticRetrievalRepository:
    """
    Combines vector similarity search with structured PostgreSQL relational filters.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.emb_repo = EmbeddingRepository(session)

    async def search_resources(
        self,
        query_vector: List[float],
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
        Executes hybrid semantic search over learning resources with metadata filtering.
        """
        # 1. Retrieve top similar resource IDs from vector index (retrieve extra to allow post-filtering)
        vector_limit = max(limit * 4, 50)
        similar_tuples = await self.emb_repo.search_similar_entities(
            entity_type="resource",
            query_vector=query_vector,
            limit=vector_limit,
            min_similarity=min_similarity
        )

        if not similar_tuples:
            return []

        id_to_score = {entity_id: score for entity_id, score in similar_tuples}
        resource_ids = list(id_to_score.keys())

        # 2. Query resources with structured relational filters
        stmt = (
            select(Resource)
            .options(
                selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill)
            )
            .where(Resource.id.in_(resource_ids))
        )

        # Apply metadata filters
        conditions = []
        if resource_types:
            conditions.append(Resource.resource_type.in_(resource_types))
        if difficulties:
            conditions.append(Resource.difficulty.in_(difficulties))
        if max_minutes:
            conditions.append(Resource.estimated_minutes <= max_minutes)
        if provider:
            conditions.append(Resource.provider.ilike(f"%{provider}%"))
        if is_interactive is not None:
            conditions.append(Resource.is_interactive == is_interactive)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        res = await self.session.execute(stmt)
        resources = res.scalars().all()

        # 3. Filter by skill_ids if provided
        filtered_results = []
        for r in resources:
            associated_skill_ids = [rs.skill_id for rs in r.resource_skills]
            if skill_ids:
                # Must match at least one skill
                if not any(sid in associated_skill_ids for sid in skill_ids):
                    continue

            score = id_to_score.get(r.id, 0.0)
            skills_taught = [rs.skill.name for rs in r.resource_skills if rs.skill]

            filtered_results.append({
                "resource": r,
                "similarity_score": round(score, 4),
                "skills_taught": skills_taught,
            })

        # 4. Sort by similarity score descending
        filtered_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return filtered_results[:limit]

    async def search_skills(
        self,
        query_vector: List[float],
        categories: Optional[List[str]] = None,
        difficulties: Optional[List[str]] = None,
        min_level: Optional[int] = None,
        max_level: Optional[int] = None,
        min_similarity: float = 0.0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid semantic search over skills with relational filters.
        """
        vector_limit = max(limit * 3, 30)
        similar_tuples = await self.emb_repo.search_similar_entities(
            entity_type="skill",
            query_vector=query_vector,
            limit=vector_limit,
            min_similarity=min_similarity
        )

        if not similar_tuples:
            return []

        id_to_score = {entity_id: score for entity_id, score in similar_tuples}
        skill_ids = list(id_to_score.keys())

        stmt = select(Skill).where(Skill.id.in_(skill_ids))

        conditions = []
        if categories:
            conditions.append(Skill.category.in_(categories))
        if difficulties:
            conditions.append(Skill.difficulty.in_(difficulties))
        if min_level is not None:
            conditions.append(Skill.level >= min_level)
        if max_level is not None:
            conditions.append(Skill.level <= max_level)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        res = await self.session.execute(stmt)
        skills = res.scalars().all()

        results = []
        for sk in skills:
            score = id_to_score.get(sk.id, 0.0)
            results.append({
                "skill": sk,
                "similarity_score": round(score, 4)
            })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:limit]

    async def search_careers(
        self,
        query_vector: List[float],
        categories: Optional[List[str]] = None,
        min_demand: Optional[int] = None,
        min_similarity: float = 0.0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid semantic search over career tracks.
        """
        vector_limit = max(limit * 3, 20)
        similar_tuples = await self.emb_repo.search_similar_entities(
            entity_type="career",
            query_vector=query_vector,
            limit=vector_limit,
            min_similarity=min_similarity
        )

        if not similar_tuples:
            return []

        id_to_score = {entity_id: score for entity_id, score in similar_tuples}
        career_ids = list(id_to_score.keys())

        stmt = select(Career).where(Career.id.in_(career_ids))

        conditions = []
        if categories:
            conditions.append(Career.category.in_(categories))
        if min_demand is not None:
            conditions.append(Career.market_demand_score >= min_demand)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        res = await self.session.execute(stmt)
        careers = res.scalars().all()

        results = []
        for c in careers:
            score = id_to_score.get(c.id, 0.0)
            results.append({
                "career": c,
                "similarity_score": round(score, 4)
            })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:limit]
