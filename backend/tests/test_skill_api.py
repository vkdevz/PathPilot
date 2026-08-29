import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_skills_api_endpoints(client: AsyncClient, auth_headers: dict):
    # 1. Public list skills
    res = await client.get("/api/v1/skills")
    assert res.status_code == 200
    skills = res.json()
    assert len(skills) > 0
    assert "slug" in skills[0]
    assert "domain" in skills[0]
    assert "prerequisites" in skills[0]

    # 2. Skill details
    res = await client.get("/api/v1/skills/ml-foundations")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "ml-foundations"
    assert "prerequisite_nodes" in data
    assert "downstream_nodes" in data

    # 3. Prerequisites graph
    res = await client.get("/api/v1/skills/deep-learning/prerequisites")
    assert res.status_code == 200
    graph = res.json()
    assert graph["target_skill_slug"] == "deep-learning"
    assert len(graph["direct_prerequisites"]) > 0
    assert len(graph["transitive_prerequisites"]) > 0

    # 4. Graph validation (Authenticated)
    res = await client.get("/api/v1/skills/graph/validate", headers=auth_headers)
    assert res.status_code == 200
    val = res.json()
    assert val["is_valid"] is True
    assert val["total_skills"] > 0
    assert len(val["cycles_detected"]) == 0

    # 5. Benchmark endpoint (Authenticated)
    res = await client.get("/api/v1/skills/benchmark", headers=auth_headers)
    assert res.status_code == 200
    bench = res.json()
    assert bench["total_profiles"] == 10
    assert "baseline_comparison" in bench

    # 6. Learner skill gaps (Authenticated)
    res = await client.get("/api/v1/skills/skill-gaps", headers=auth_headers)
    assert res.status_code == 200
    gaps = res.json()
    assert "career_readiness_score" in gaps
    assert "skill_gaps" in gaps

    # 7. Next Best Skill (Authenticated)
    res = await client.get("/api/v1/skills/next-best-skill", headers=auth_headers)
    assert res.status_code == 200
    # May return a skill or null
