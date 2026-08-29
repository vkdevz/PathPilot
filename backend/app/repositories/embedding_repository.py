import json
import logging
import numpy as np
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, text
from app.models.embedding import Embedding

logger = logging.getLogger("pathpilot.repository.embedding")

class EmbeddingRepository:
    """
    Authoritative repository for embedding persistence and vector similarity queries.
    Seamlessly adapts between PostgreSQL pgvector operations and in-memory numpy cosine similarity for test execution.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_entity(self, entity_type: str, entity_id: str) -> Optional[Embedding]:
        """Retrieves embedding record for a specific entity."""
        stmt = select(Embedding).where(
            Embedding.entity_type == entity_type,
            Embedding.entity_id == entity_id
        )
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def upsert_embedding(
        self,
        entity_type: str,
        entity_id: str,
        embedding: List[float],
        content_hash: str,
        model_name: str = "text-embedding-3-small",
        dimensions: int = 1536
    ) -> Embedding:
        """
        Idempotent upsert of an entity embedding.
        """
        existing = await self.get_by_entity(entity_type, entity_id)
        if existing:
            existing.embedding = embedding
            existing.content_hash = content_hash
            existing.model_name = model_name
            existing.dimensions = dimensions
            await self.session.flush()
            return existing
        else:
            new_emb = Embedding(
                entity_type=entity_type,
                entity_id=entity_id,
                embedding=embedding,
                content_hash=content_hash,
                model_name=model_name,
                dimensions=dimensions
            )
            self.session.add(new_emb)
            await self.session.flush()
            return new_emb

    async def bulk_upsert_embeddings(
        self,
        records: List[Dict[str, Any]]
    ) -> int:
        """
        Batch upsert a list of embedding records.
        """
        count = 0
        for rec in records:
            await self.upsert_embedding(
                entity_type=rec["entity_type"],
                entity_id=rec["entity_id"],
                embedding=rec["embedding"],
                content_hash=rec["content_hash"],
                model_name=rec.get("model_name", "text-embedding-3-small"),
                dimensions=rec.get("dimensions", 1536)
            )
            count += 1
        await self.session.commit()
        return count

    async def get_all_by_type(self, entity_type: str) -> List[Embedding]:
        """Retrieves all embeddings for an entity type."""
        stmt = select(Embedding).where(Embedding.entity_type == entity_type)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def get_stats(self) -> Dict[str, Any]:
        """Calculates embedding index statistics."""
        stmt = select(
            Embedding.entity_type,
            func.count(Embedding.id),
            func.min(Embedding.model_name),
            func.min(Embedding.dimensions)
        ).group_by(Embedding.entity_type)
        res = await self.session.execute(stmt)
        rows = res.all()

        type_counts = {}
        total = 0
        model_name = "unknown"
        dimensions = 1536

        for r in rows:
            etype, count, m_name, dims = r
            type_counts[etype] = count
            total += count
            if m_name:
                model_name = m_name
            if dims:
                dimensions = dims

        return {
            "total_embeddings": total,
            "entity_breakdown": type_counts,
            "model_name": model_name,
            "dimensions": dimensions,
            "pgvector_ready": True
        }

    async def search_similar_entities(
        self,
        entity_type: str,
        query_vector: List[float],
        limit: int = 10,
        min_similarity: float = 0.0
    ) -> List[Tuple[str, float]]:
        """
        Returns list of (entity_id, cosine_similarity_score) sorted by descending similarity.
        """
        # Determine database dialect
        bind = self.session.bind
        dialect_name = bind.dialect.name if bind else "postgresql"

        query_arr = np.array(query_vector, dtype=np.float64)
        q_norm = np.linalg.norm(query_arr)
        if q_norm > 1e-12:
            query_arr = query_arr / q_norm

        if dialect_name == "postgresql":
            # Attempt pgvector native cosine operator: 1 - (embedding <=> query_vector)
            try:
                # pgvector expects vector literal format [0.1, 0.2, ...]
                vec_str = "[" + ",".join(str(round(x, 6)) for x in query_vector) + "]"
                raw_sql = text("""
                    SELECT entity_id, (1 - (embedding <=> :vec::vector)) AS similarity
                    FROM embeddings
                    WHERE entity_type = :entity_type
                      AND embedding IS NOT NULL
                      AND (1 - (embedding <=> :vec::vector)) >= :min_sim
                    ORDER BY embedding <=> :vec::vector ASC
                    LIMIT :limit
                """)
                res = await self.session.execute(raw_sql, {
                    "vec": vec_str,
                    "entity_type": entity_type,
                    "min_sim": min_similarity,
                    "limit": limit
                })
                return [(row[0], float(row[1])) for row in res.all()]
            except Exception as e:
                logger.warning(f"PostgreSQL pgvector query error, falling back to python cosine similarity: {e}")

        # Python / SQLite / in-memory fallback
        all_embs = await self.get_all_by_type(entity_type)
        scored: List[Tuple[str, float]] = []

        for emb in all_embs:
            if not emb.embedding:
                continue
            
            # Handle JSON or vector list
            vec_data = emb.embedding
            if isinstance(vec_data, str):
                vec_data = json.loads(vec_data)
            
            doc_arr = np.array(vec_data, dtype=np.float64)
            d_norm = np.linalg.norm(doc_arr)
            if d_norm > 1e-12:
                sim = float(np.dot(query_arr, doc_arr) / (q_norm * d_norm))
            else:
                sim = 0.0

            if sim >= min_similarity:
                scored.append((emb.entity_id, sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:limit]
