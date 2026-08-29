import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.skill_gap.benchmark_evaluator import SkillGapBenchmarkEvaluator

@pytest.mark.asyncio
async def test_all_benchmark_scenarios_1_to_10(db_session: AsyncSession):
    """
    Validates Scenarios 1 through 5 (and extended 6-10) using the SkillGapBenchmarkEvaluator.
    """
    evaluator = SkillGapBenchmarkEvaluator(db_session)
    results = await evaluator.run_benchmark()

    # Verify overall benchmark health
    assert results.total_profiles == 10
    assert results.bottleneck_accuracy_pct >= 90.0
    assert results.prerequisite_safety_pct == 100.0
    assert results.next_skill_correctness_pct >= 90.0
    assert results.avg_latency_ms < 50.0

    # Inspect specific scenarios
    by_id = {r["profile_id"]: r for r in results.detailed_results}

    # Scenario 1: Stats bottleneck
    s1 = by_id["scenario_1_stats_bottleneck"]
    assert "stats-ds" in s1["bottlenecks_found"]
    assert s1["next_best_skill"] == "stats-ds"

    # Scenario 2: Stats resolved, ML unlocked
    s2 = by_id["scenario_2_ml_unlocked"]
    assert s2["next_best_skill"] == "ml-foundations"

    # Scenario 3: Deep learning blocked
    s3 = by_id["scenario_3_deep_learning_blocked"]
    assert s3["next_best_skill"] == "python-ds" # Root unblocker

    # Scenario 4: Cold start
    s4 = by_id["scenario_4_cold_start"]
    assert s4["confidence_score"] <= 30.0

    # Scenario 5: Conflicting evidence
    s5 = by_id["scenario_5_conflicting_evidence"]
    assert s5["next_best_skill"] == "ml-basics"

    # Baseline comparison check
    baseline = results.baseline_comparison
    assert "graph_aware_engine" in baseline
    assert "raw_gap_baseline" in baseline
    assert baseline["graph_aware_engine"]["prerequisite_violation_rate"] == "0.0%"
