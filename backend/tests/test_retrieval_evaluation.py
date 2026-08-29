import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.embedding.retrieval_evaluation import (
    calculate_precision_at_k,
    calculate_recall_at_k,
    calculate_reciprocal_rank,
    calculate_ndcg_at_k,
    RetrievalEvaluator
)

def test_ir_metric_calculations():
    retrieved = ["doc_a", "doc_b", "doc_c", "doc_d", "doc_e"]
    relevant = {"doc_a", "doc_c", "doc_x"}

    # Precision@3 = 2 / 3
    p3 = calculate_precision_at_k(retrieved, relevant, 3)
    assert round(p3, 2) == 0.67

    # Recall@5 = 2 / 3
    r5 = calculate_recall_at_k(retrieved, relevant, 5)
    assert round(r5, 2) == 0.67

    # MRR: first relevant is at rank 1 -> 1/1 = 1.0
    mrr = calculate_reciprocal_rank(retrieved, relevant)
    assert mrr == 1.0

    # NDCG@3
    ndcg = calculate_ndcg_at_k(retrieved, relevant, 3)
    assert 0.0 < ndcg <= 1.0

@pytest.mark.asyncio
async def test_retrieval_evaluator_suite_execution(db_session: AsyncSession):
    evaluator = RetrievalEvaluator(db_session)
    report = await evaluator.evaluate_suite(k=5)

    assert report["status"] == "success"
    assert report["k"] == 5
    assert report["total_benchmark_queries"] > 0
    assert "precision_at_5" in report["metrics"]
    assert "recall_at_5" in report["metrics"]
    assert "mrr" in report["metrics"]
    assert "ndcg_at_5" in report["metrics"]
    assert report["metrics"]["precision_at_5"] > 0.0
    assert report["metrics"]["mrr"] > 0.0
