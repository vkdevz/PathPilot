import pytest
from app.services.recommendation.recommendation_evaluator import RecommendationEvaluator

@pytest.mark.asyncio
async def test_recommendation_evaluation_suite(db_session):
    evaluator = RecommendationEvaluator(db_session)
    report = await evaluator.evaluate_suite(k=5)

    assert report["status"] == "completed"
    assert report["k"] == 5
    assert report["total_test_learners"] >= 2
    assert len(report["comparison"]) == 5 # 5 models evaluated

    model_names = [m["model_name"] for m in report["comparison"]]
    assert "PathPilot Hybrid AI Engine" in model_names
    assert "Random Baseline" in model_names
    assert "Popularity / Static Baseline" in model_names
    assert "Semantic-Only Baseline" in model_names
    assert "Rule / Skill-Gap Only Baseline" in model_names

    hybrid_metric = next(m for m in report["comparison"] if "Hybrid" in m["model_name"])
    random_metric = next(m for m in report["comparison"] if "Random" in m["model_name"])

    # Hybrid should outperform random baseline in precision and NDCG
    assert hybrid_metric["precision_at_k"] >= random_metric["precision_at_k"]
    assert hybrid_metric["ndcg_at_k"] >= random_metric["ndcg_at_k"]
    # Prerequisite violation rate must be 0 for Hybrid
    assert hybrid_metric["prerequisite_violation_rate"] == 0.0
