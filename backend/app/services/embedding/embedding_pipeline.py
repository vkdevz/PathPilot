import time
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.resource import Resource, ResourceSkill
from app.models.skill import Skill, SkillPrerequisite
from app.models.career import Career, CareerSkill
from app.repositories.embedding_repository import EmbeddingRepository
from app.services.embedding.text_preprocessor import TextPreprocessor
from app.services.embedding.provider_factory import get_embedding_provider

logger = logging.getLogger("pathpilot.embedding.pipeline")

class EmbeddingPipelineService:
    """
    Service responsible for batch ingestion, incremental change detection,
    and embedding vector updates for resources, skills, and careers.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.emb_repo = EmbeddingRepository(session)
        self.provider = get_embedding_provider()

    async def generate_resource_embeddings(self, force: bool = False) -> Dict[str, int]:
        """
        Embeds all learning resources in the database.
        Uses content_hash diffing to skip unmodified records unless force=True.
        """
        stmt = (
            select(Resource)
            .options(
                selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill)
            )
        )
        res = await self.session.execute(stmt)
        resources = res.scalars().all()

        created, updated, skipped = 0, 0, 0
        texts_to_embed: List[str] = []
        pending_items: List[Dict[str, Any]] = []

        for r in resources:
            skills = [rs.skill for rs in r.resource_skills if rs.skill]
            text = TextPreprocessor.prepare_resource_text(r, skills)
            chash = TextPreprocessor.compute_hash(text)

            existing = await self.emb_repo.get_by_entity("resource", r.id)
            if not force and existing and existing.content_hash == chash and existing.embedding:
                skipped += 1
                continue

            texts_to_embed.append(text)
            pending_items.append({
                "entity_type": "resource",
                "entity_id": r.id,
                "content_hash": chash,
                "is_update": bool(existing)
            })

        if texts_to_embed:
            embeddings = await self.provider.embed_batch(texts_to_embed)
            for idx, item in enumerate(pending_items):
                emb_vec = embeddings[idx]
                await self.emb_repo.upsert_embedding(
                    entity_type=item["entity_type"],
                    entity_id=item["entity_id"],
                    embedding=emb_vec,
                    content_hash=item["content_hash"],
                    model_name=self.provider.model_name,
                    dimensions=self.provider.dimension
                )
                if item["is_update"]:
                    updated += 1
                else:
                    created += 1

        await self.session.commit()
        return {"created": created, "updated": updated, "skipped": skipped, "total": len(resources)}

    async def generate_skill_embeddings(self, force: bool = False) -> Dict[str, int]:
        """
        Embeds all skills in the database with prerequisite context.
        """
        stmt = (
            select(Skill)
            .options(
                selectinload(Skill.prerequisites).selectinload(SkillPrerequisite.prerequisite_skill)
            )
        )
        res = await self.session.execute(stmt)
        skills = res.scalars().all()

        created, updated, skipped = 0, 0, 0
        texts_to_embed: List[str] = []
        pending_items: List[Dict[str, Any]] = []

        for sk in skills:
            prereqs = [sp.prerequisite_skill for sp in sk.prerequisites if sp.prerequisite_skill]
            text = TextPreprocessor.prepare_skill_text(sk, prereqs)
            chash = TextPreprocessor.compute_hash(text)

            existing = await self.emb_repo.get_by_entity("skill", sk.id)
            if not force and existing and existing.content_hash == chash and existing.embedding:
                skipped += 1
                continue

            texts_to_embed.append(text)
            pending_items.append({
                "entity_type": "skill",
                "entity_id": sk.id,
                "content_hash": chash,
                "is_update": bool(existing)
            })

        if texts_to_embed:
            embeddings = await self.provider.embed_batch(texts_to_embed)
            for idx, item in enumerate(pending_items):
                emb_vec = embeddings[idx]
                await self.emb_repo.upsert_embedding(
                    entity_type=item["entity_type"],
                    entity_id=item["entity_id"],
                    embedding=emb_vec,
                    content_hash=item["content_hash"],
                    model_name=self.provider.model_name,
                    dimensions=self.provider.dimension
                )
                if item["is_update"]:
                    updated += 1
                else:
                    created += 1

        await self.session.commit()
        return {"created": created, "updated": updated, "skipped": skipped, "total": len(skills)}

    async def generate_career_embeddings(self, force: bool = False) -> Dict[str, int]:
        """
        Embeds all career tracks in the database.
        """
        stmt = (
            select(Career)
            .options(
                selectinload(Career.career_skills).selectinload(CareerSkill.skill)
            )
        )
        res = await self.session.execute(stmt)
        careers = res.scalars().all()

        created, updated, skipped = 0, 0, 0
        texts_to_embed: List[str] = []
        pending_items: List[Dict[str, Any]] = []

        for c in careers:
            skills = [cs.skill for cs in c.career_skills if cs.skill]
            text = TextPreprocessor.prepare_career_text(c, skills)
            chash = TextPreprocessor.compute_hash(text)

            existing = await self.emb_repo.get_by_entity("career", c.id)
            if not force and existing and existing.content_hash == chash and existing.embedding:
                skipped += 1
                continue

            texts_to_embed.append(text)
            pending_items.append({
                "entity_type": "career",
                "entity_id": c.id,
                "content_hash": chash,
                "is_update": bool(existing)
            })

        if texts_to_embed:
            embeddings = await self.provider.embed_batch(texts_to_embed)
            for idx, item in enumerate(pending_items):
                emb_vec = embeddings[idx]
                await self.emb_repo.upsert_embedding(
                    entity_type=item["entity_type"],
                    entity_id=item["entity_id"],
                    embedding=emb_vec,
                    content_hash=item["content_hash"],
                    model_name=self.provider.model_name,
                    dimensions=self.provider.dimension
                )
                if item["is_update"]:
                    updated += 1
                else:
                    created += 1

        await self.session.commit()
        return {"created": created, "updated": updated, "skipped": skipped, "total": len(careers)}

    async def generate_all(self, force: bool = False) -> Dict[str, Any]:
        """
        Executes full multi-entity embedding pipeline.
        """
        start_time = time.time()
        res_stats = await self.generate_resource_embeddings(force=force)
        sk_stats = await self.generate_skill_embeddings(force=force)
        car_stats = await self.generate_career_embeddings(force=force)
        duration_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "completed",
            "duration_ms": duration_ms,
            "provider": self.provider.model_name,
            "dimension": self.provider.dimension,
            "resources": res_stats,
            "skills": sk_stats,
            "careers": car_stats,
            "total_processed": res_stats["total"] + sk_stats["total"] + car_stats["total"],
            "total_upserted": (
                res_stats["created"] + res_stats["updated"] +
                sk_stats["created"] + sk_stats["updated"] +
                car_stats["created"] + car_stats["updated"]
            ),
            "total_skipped": res_stats["skipped"] + sk_stats["skipped"] + car_stats["skipped"]
        }
