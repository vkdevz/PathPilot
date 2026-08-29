import logging
from typing import Dict, List, Set, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.resource import Resource, ResourceSkill
from app.models.skill import Skill
from app.services.retrieval_service import RetrievalService
from app.services.recommendation.types import LearnerState, CandidateResource

logger = logging.getLogger("pathpilot.recommendation.candidate_generator")

class CandidateGenerator:
    """
    Multi-channel candidate generation combining:
    1. Unlocked Skill Gap Channel (Structured SQL)
    2. Active Roadmap Milestone Channel (Structured SQL)
    3. Semantic Vector Retrieval Channel (pgvector Cosine Search)
    4. Domain Exploration Channel (Interactive Discovery)
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.retrieval_service = RetrievalService(session)

    async def generate_candidates(self, learner: LearnerState, limit: int = 30) -> List[CandidateResource]:
        candidate_map: Dict[str, CandidateResource] = {}

        # 1. Channel 1: Priority Skill Gap Channel
        unlocked_gaps = [g for g in learner.skill_gaps if g.is_prerequisite_met and g.gap_magnitude > 0]
        priority_skill_ids = [g.skill_id for g in unlocked_gaps[:4]]

        if priority_skill_ids:
            stmt = (
                select(Resource)
                .join(ResourceSkill, Resource.id == ResourceSkill.resource_id)
                .options(selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill))
                .where(ResourceSkill.skill_id.in_(priority_skill_ids))
            )
            res = await self.session.execute(stmt)
            gap_resources = res.scalars().all()
            for r in gap_resources:
                if r.id not in candidate_map:
                    candidate_map[r.id] = CandidateResource(resource=r, channels=["skill_gap"])
                else:
                    if "skill_gap" not in candidate_map[r.id].channels:
                        candidate_map[r.id].channels.append("skill_gap")

        # 2. Channel 2: Active Roadmap Milestone Channel
        if learner.active_milestone_skill_id:
            stmt = (
                select(Resource)
                .join(ResourceSkill, Resource.id == ResourceSkill.resource_id)
                .options(selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill))
                .where(ResourceSkill.skill_id == learner.active_milestone_skill_id)
            )
            res = await self.session.execute(stmt)
            milestone_resources = res.scalars().all()
            for r in milestone_resources:
                if r.id not in candidate_map:
                    candidate_map[r.id] = CandidateResource(resource=r, channels=["active_milestone"])
                else:
                    if "active_milestone" not in candidate_map[r.id].channels:
                        candidate_map[r.id].channels.append("active_milestone")

        # 3. Channel 3: Semantic Retrieval Channel (pgvector)
        # Formulate rich natural language context query
        query_terms = [learner.target_career_name]
        if learner.active_milestone_skill_name:
            query_terms.append(learner.active_milestone_skill_name)
        top_gaps = [g.skill_name for g in unlocked_gaps[:2]]
        if top_gaps:
            query_terms.extend(top_gaps)
        semantic_query = " ".join(query_terms)

        try:
            semantic_results = await self.retrieval_service.search_resources(
                query=semantic_query,
                limit=15
            )
            for s_item in semantic_results:
                r_id = s_item["id"]
                sim = s_item["similarity_score"]
                if r_id in candidate_map:
                    candidate_map[r_id].semantic_similarity = max(candidate_map[r_id].semantic_similarity, sim)
                    if "semantic" not in candidate_map[r_id].channels:
                        candidate_map[r_id].channels.append("semantic")
                else:
                    # Fetch full resource object with relationships
                    stmt = (
                        select(Resource)
                        .options(selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill))
                        .where(Resource.id == r_id)
                    )
                    res = await self.session.execute(stmt)
                    r_obj = res.scalar_one_or_none()
                    if r_obj:
                        candidate_map[r_id] = CandidateResource(
                            resource=r_obj,
                            channels=["semantic"],
                            semantic_similarity=sim
                        )
        except Exception as e:
            logger.warning(f"Semantic candidate retrieval fallback note: {e}")

        # 4. Channel 4: Exploration / High-Yield Channel (Discovery fallback)
        stmt = (
            select(Resource)
            .options(selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill))
            .limit(10)
        )
        res = await self.session.execute(stmt)
        exploration_resources = res.scalars().all()
        for r in exploration_resources:
            if r.id not in candidate_map:
                candidate_map[r.id] = CandidateResource(resource=r, channels=["exploration"])
            else:
                if "exploration" not in candidate_map[r.id].channels:
                    candidate_map[r.id].channels.append("exploration")

        # Associate primary target skill for each candidate
        for cr in candidate_map.values():
            if cr.resource.resource_skills:
                cr.primary_target_skill = cr.resource.resource_skills[0].skill

        return list(candidate_map.values())[:limit]
