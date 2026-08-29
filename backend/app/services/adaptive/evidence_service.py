import hashlib
import json
import logging
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.adaptive import LearnerEvidence
from app.services.adaptive.config import (
    EVIDENCE_RELIABILITY_WEIGHTS,
    EVIDENCE_BASE_CONFIDENCE,
)

logger = logging.getLogger("pathpilot.adaptive.evidence")

class EvidenceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def calculate_dedup_hash(
        user_id: str,
        skill_id: str,
        evidence_type: str,
        source_id: Optional[str],
        score: float
    ) -> str:
        """
        Deterministic SHA-256 hash preventing duplicate state mutation.
        """
        raw_key = f"{user_id}:{skill_id}:{evidence_type}:{source_id or 'none'}:{score:.4f}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    async def record_evidence(
        self,
        user_id: str,
        skill_id: str,
        evidence_type: str,
        score: float, # Normalized 0.0 - 1.0 or 0 - 100 percentage
        raw_score: Optional[float] = None,
        source_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[LearnerEvidence, bool]:
        """
        Validates, deduplicates, and persists a verified learning evidence item.
        Returns: (LearnerEvidence, is_new_record)
        """
        # Normalize score to 0.0 - 1.0
        normalized_score = score / 100.0 if score > 1.0 else max(0.0, min(1.0, score))
        if raw_score is None:
            raw_score = score if score > 1.0 else score * 100.0

        dedup_key = self.calculate_dedup_hash(
            user_id=user_id,
            skill_id=skill_id,
            evidence_type=evidence_type,
            source_id=source_id,
            score=normalized_score
        )

        # 1. Check for existing duplicate
        query = select(LearnerEvidence).where(LearnerEvidence.dedup_hash == dedup_key)
        result = await self.db.execute(query)
        existing = result.scalar_one_or_none()

        if existing:
            logger.info(f"Duplicate evidence detected for user={user_id}, skill={skill_id}. Skipping mutation.")
            return existing, False

        # 2. Derive reliability weight & epistemic confidence
        normalized_type = evidence_type.upper()
        weight = EVIDENCE_RELIABILITY_WEIGHTS.get(normalized_type, 0.50)
        confidence = EVIDENCE_BASE_CONFIDENCE.get(normalized_type, 0.60)

        # 3. Create and persist
        evidence = LearnerEvidence(
            user_id=user_id,
            skill_id=skill_id,
            evidence_type=normalized_type,
            source_id=source_id,
            score=normalized_score,
            raw_score=raw_score,
            confidence=confidence,
            weight=weight,
            dedup_hash=dedup_key,
            metadata_json=metadata or {}
        )
        self.db.add(evidence)
        await self.db.flush()

        logger.info(
            f"Evidence recorded: user={user_id}, skill={skill_id}, type={normalized_type}, "
            f"score={normalized_score:.2f}, weight={weight:.2f}"
        )
        return evidence, True

    async def get_evidence_for_skill(
        self,
        user_id: str,
        skill_id: str,
        limit: int = 20
    ) -> list[LearnerEvidence]:
        """
        Retrieves all chronological evidence items for a specific user and skill.
        """
        query = (
            select(LearnerEvidence)
            .where(LearnerEvidence.user_id == user_id, LearnerEvidence.skill_id == skill_id)
            .order_by(LearnerEvidence.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
