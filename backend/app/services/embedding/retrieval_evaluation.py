import math
import time
from typing import List, Dict, Any, Set
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.semantic_retrieval_repository import SemanticRetrievalRepository
from app.services.embedding.provider_factory import get_embedding_provider

# Benchmark queries with ground-truth relevant entity slugs
RETRIEVAL_BENCHMARK_QUERIES = [
    {
        "query": "machine learning foundations statistics and python data analysis",
        "entity_type": "resource",
        "relevant_slugs": [
            "res-python-mastery",
            "res-ml-pipeline-project",
            "res-stats-prob-interactive",
            "res-pandas-eda-project"
        ]
    },
    {
        "query": "full stack web development react typescript fastapi backend",
        "entity_type": "resource",
        "relevant_slugs": [
            "res-react-fastapi-fullstack",
            "res-sql-interactive-lab"
        ]
    },
    {
        "query": "cloud infrastructure automation terraform kubernetes aws",
        "entity_type": "resource",
        "relevant_slugs": [
            "res-terraform-aws-lab"
        ]
    },
    {
        "query": "cybersecurity ethical hacking penetration testing threat detection",
        "entity_type": "resource",
        "relevant_slugs": [
            "res-threat-hunting-siem"
        ]
    },
    {
        "query": "generative ai agents llm rag vector databases",
        "entity_type": "resource",
        "relevant_slugs": [
            "res-rag-agent-workshop",
            "res-python-mastery"
        ]
    },
    {
        "query": "predictive modeling and statistical data science",
        "entity_type": "skill",
        "relevant_slugs": [
            "stats-ds",
            "ml-foundations",
            "data-analysis",
            "deep-learning"
        ]
    }
]

def calculate_precision_at_k(retrieved_slugs: List[str], relevant_slugs: Set[str], k: int) -> float:
    """Calculates Precision@K = (relevant in top K) / K"""
    top_k = retrieved_slugs[:k]
    if not top_k:
        return 0.0
    relevant_count = sum(1 for s in top_k if s in relevant_slugs)
    return relevant_count / len(top_k)

def calculate_recall_at_k(retrieved_slugs: List[str], relevant_slugs: Set[str], k: int) -> float:
    """Calculates Recall@K = (relevant in top K) / (total relevant)"""
    if not relevant_slugs:
        return 1.0
    top_k = retrieved_slugs[:k]
    relevant_count = sum(1 for s in top_k if s in relevant_slugs)
    return relevant_count / len(relevant_slugs)

def calculate_reciprocal_rank(retrieved_slugs: List[str], relevant_slugs: Set[str]) -> float:
    """Calculates Reciprocal Rank = 1 / (rank of first relevant item)"""
    for rank, slug in enumerate(retrieved_slugs, start=1):
        if slug in relevant_slugs:
            return 1.0 / rank
    return 0.0

def calculate_ndcg_at_k(retrieved_slugs: List[str], relevant_slugs: Set[str], k: int) -> float:
    """Calculates Normalized Discounted Cumulative Gain (NDCG@K) with binary relevance."""
    top_k = retrieved_slugs[:k]
    if not top_k or not relevant_slugs:
        return 0.0

    # Calculate DCG
    dcg = 0.0
    for i, slug in enumerate(top_k):
        rel = 1.0 if slug in relevant_slugs else 0.0
        dcg += rel / math.log2(i + 2)  # index 0 -> log2(2) = 1

    # Calculate Ideal DCG (IDCG)
    idcg = 0.0
    ideal_hits = min(len(relevant_slugs), k)
    for i in range(ideal_hits):
        idcg += 1.0 / math.log2(i + 2)

    return (dcg / idcg) if idcg > 0.0 else 0.0

class RetrievalEvaluator:
    """
    Automated evaluation framework for measuring Semantic Retrieval quality.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.retrieval_repo = SemanticRetrievalRepository(session)
        self.provider = get_embedding_provider()

    async def evaluate_suite(self, k: int = 5) -> Dict[str, Any]:
        """
        Executes the evaluation benchmark and returns aggregate metrics.
        """
        start_time = time.time()
        query_results = []
        precision_scores = []
        recall_scores = []
        rr_scores = []
        ndcg_scores = []
        latencies_ms = []

        for item in RETRIEVAL_BENCHMARK_QUERIES:
            query = item["query"]
            entity_type = item["entity_type"]
            relevant_slugs = set(item["relevant_slugs"])

            q_start = time.time()
            query_vec = await self.provider.embed_text(query)

            if entity_type == "resource":
                results = await self.retrieval_repo.search_resources(query_vector=query_vec, limit=k)
                retrieved_slugs = [r["resource"].slug for r in results]
                scores = [r["similarity_score"] for r in results]
            else:
                results = await self.retrieval_repo.search_skills(query_vector=query_vec, limit=k)
                retrieved_slugs = [s["skill"].slug for s in results]
                scores = [s["similarity_score"] for s in results]

            latency = round((time.time() - q_start) * 1000, 2)
            latencies_ms.append(latency)

            p_k = calculate_precision_at_k(retrieved_slugs, relevant_slugs, k)
            r_k = calculate_recall_at_k(retrieved_slugs, relevant_slugs, k)
            mrr = calculate_reciprocal_rank(retrieved_slugs, relevant_slugs)
            ndcg = calculate_ndcg_at_k(retrieved_slugs, relevant_slugs, k)

            precision_scores.append(p_k)
            recall_scores.append(r_k)
            rr_scores.append(mrr)
            ndcg_scores.append(ndcg)

            query_results.append({
                "query": query,
                "entity_type": entity_type,
                "retrieved_slugs": retrieved_slugs,
                "similarity_scores": scores,
                "precision_at_k": round(p_k, 3),
                "recall_at_k": round(r_k, 3),
                "reciprocal_rank": round(mrr, 3),
                "ndcg_at_k": round(ndcg, 3),
                "latency_ms": latency
            })

        mean_precision = round(sum(precision_scores) / len(precision_scores), 3) if precision_scores else 0.0
        mean_recall = round(sum(recall_scores) / len(recall_scores), 3) if recall_scores else 0.0
        mean_mrr = round(sum(rr_scores) / len(rr_scores), 3) if rr_scores else 0.0
        mean_ndcg = round(sum(ndcg_scores) / len(ndcg_scores), 3) if ndcg_scores else 0.0
        avg_latency = round(sum(latencies_ms) / len(latencies_ms), 2) if latencies_ms else 0.0
        total_duration = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "success",
            "k": k,
            "total_benchmark_queries": len(RETRIEVAL_BENCHMARK_QUERIES),
            "metrics": {
                f"precision_at_{k}": mean_precision,
                f"recall_at_{k}": mean_recall,
                "mrr": mean_mrr,
                f"ndcg_at_{k}": mean_ndcg,
                "avg_query_latency_ms": avg_latency,
            },
            "total_duration_ms": total_duration,
            "queries": query_results
        }
