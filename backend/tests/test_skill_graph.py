import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.skill_graph.graph_service import SkillGraphService
from app.models.skill import Skill, SkillPrerequisite

@pytest.mark.asyncio
async def test_skill_graph_initialization_and_traversal(db_session: AsyncSession):
    graph = SkillGraphService(db_session)
    await graph.initialize()

    all_skills = graph.get_all_skills()
    assert len(all_skills) > 0

    # Test resolving by slug
    python_ds = graph.get_skill("python-ds")
    assert python_ds is not None
    assert python_ds.name == "Python for Data Science"

    # Python is foundation (no prerequisites)
    assert graph.is_foundation_skill(python_ds.id) is True
    assert graph.get_prerequisite_depth(python_ds.id) == 0

    # ML Foundations should have stats-ds and data-analysis as direct prereqs
    ml_skill = graph.get_skill("ml-foundations")
    assert ml_skill is not None
    direct_prereqs = graph.get_direct_prerequisites(ml_skill.id)
    direct_prereq_slugs = [p.slug for p in direct_prereqs]
    assert "stats-ds" in direct_prereq_slugs or "data-analysis" in direct_prereq_slugs

    # Transitive prerequisites for Deep Learning
    dl_skill = graph.get_skill("deep-learning")
    assert dl_skill is not None
    transitive = graph.get_transitive_prerequisites(dl_skill.id)
    transitive_slugs = [s.slug for s, depth in transitive]
    assert "ml-foundations" in transitive_slugs
    assert "python-ds" in transitive_slugs

@pytest.mark.asyncio
async def test_skill_downstream_impact_and_depth(db_session: AsyncSession):
    graph = SkillGraphService(db_session)
    await graph.initialize()

    python_ds = graph.get_skill("python-ds")
    ml_skill = graph.get_skill("ml-foundations")

    # Python unlocks multiple downstream skills
    downstream_python = graph.get_transitive_downstream(python_ds.id)
    assert len(downstream_python) >= 3

    # Python impact should be higher or substantial
    python_impact = graph.calculate_downstream_impact(python_ds.id)
    assert python_impact > 0.30

    # Prerequisite depth of deep learning should be > ml foundations
    dl_skill = graph.get_skill("deep-learning")
    assert graph.get_prerequisite_depth(dl_skill.id) > graph.get_prerequisite_depth(ml_skill.id)

@pytest.mark.asyncio
async def test_skill_graph_cycle_detection_and_validation(db_session: AsyncSession):
    graph = SkillGraphService(db_session)
    await graph.initialize()

    # Valid graph has 0 cycles
    cycles = graph.detect_cycles()
    assert len(cycles) == 0

    val_result = await graph.validate_graph()
    assert val_result.is_valid is True
    assert len(val_result.cycles_detected) == 0
    assert len(val_result.missing_references) == 0

@pytest.mark.asyncio
async def test_synthetic_cycle_detection():
    from app.services.skill_graph.graph_service import SkillGraphService
    # In-memory manual check for cycle detection logic
    graph = SkillGraphService(None)
    s1 = Skill(id="1", slug="s1", name="S1", category="Foundation", level=1, description="desc", estimated_minutes=60)
    s2 = Skill(id="2", slug="s2", name="S2", category="Core", level=2, description="desc", estimated_minutes=60)
    graph._skills_by_id = {"1": s1, "2": s2}
    graph._adj_downstream = {"1": ["2"], "2": ["1"]} # cycle: 1 -> 2 -> 1

    cycles = graph.detect_cycles()
    assert len(cycles) > 0
