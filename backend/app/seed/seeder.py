import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import async_engine, AsyncSessionLocal, Base
from app.models.career import Career, CareerSkill
from app.models.skill import Skill, SkillPrerequisite
from app.models.resource import Resource, ResourceSkill
from app.models.assessment import Assessment, Question
from app.seed.seed_data import CAREERS_SEED, SKILLS_SEED, RESOURCES_SEED, QUESTIONS_SEED
from app.services.embedding.embedding_pipeline import EmbeddingPipelineService

logger = logging.getLogger("pathpilot.seeder")

async def seed_database(session: AsyncSession) -> None:
    """
    Idempotent seeder that populates PostgreSQL with careers, skills, prerequisites,
    multi-type resources, diagnostic question banks, and generates semantic vector embeddings.
    """
    logger.info("Starting PostgreSQL database seeding...")

    # 1. Seed Skills
    skill_map = {}
    for sk_data in SKILLS_SEED:
        stmt = select(Skill).where(Skill.slug == sk_data["slug"])
        res = await session.execute(stmt)
        skill = res.scalar_one_or_none()
        if not skill:
            skill = Skill(
                slug=sk_data["slug"],
                name=sk_data["name"],
                category=sk_data["category"],
                domain=sk_data.get("domain", "General"),
                difficulty=sk_data["difficulty"],
                level=sk_data["level"],
                description=sk_data["description"],
                estimated_minutes=sk_data["estimated_minutes"],
                is_active=True,
                metadata_json=sk_data.get("metadata_json", {})
            )
            session.add(skill)
            await session.flush()
        else:
            skill.domain = sk_data.get("domain", skill.domain or "General")
            skill.is_active = True
        skill_map[sk_data["slug"]] = skill

    # 2. Seed Skill Prerequisites
    for sk_data in SKILLS_SEED:
        target_skill = skill_map[sk_data["slug"]]
        for prereq_slug in sk_data.get("prerequisites", []):
            if prereq_slug in skill_map:
                prereq_skill = skill_map[prereq_slug]
                stmt = select(SkillPrerequisite).where(
                    SkillPrerequisite.skill_id == target_skill.id,
                    SkillPrerequisite.prerequisite_skill_id == prereq_skill.id
                )
                res = await session.execute(stmt)
                if not res.scalar_one_or_none():
                    prereq_entry = SkillPrerequisite(
                        skill_id=target_skill.id,
                        prerequisite_skill_id=prereq_skill.id,
                        relationship_type="prerequisite",
                        strength=1.0,
                        is_mandatory=True
                    )
                    session.add(prereq_entry)
    await session.flush()

    # 3. Seed Careers & Career Skills
    career_map = {}
    for c_data in CAREERS_SEED:
        stmt = select(Career).where(Career.slug == c_data["slug"])
        res = await session.execute(stmt)
        career = res.scalar_one_or_none()
        if not career:
            career = Career(
                slug=c_data["slug"],
                name=c_data["name"],
                category=c_data["category"],
                icon=c_data["icon"],
                description=c_data["description"],
                market_demand_score=c_data["market_demand_score"],
                salary_range=c_data["salary_range"]
            )
            session.add(career)
            await session.flush()
        career_map[c_data["slug"]] = career

        # Link Career Skills
        num_skills = len(c_data.get("skills", [])) or 1
        for order, sk_slug in enumerate(c_data.get("skills", []), start=1):
            if sk_slug in skill_map:
                sk = skill_map[sk_slug]
                stmt = select(CareerSkill).where(
                    CareerSkill.career_id == career.id,
                    CareerSkill.skill_id == sk.id
                )
                res = await session.execute(stmt)
                cs = res.scalar_one_or_none()
                # Determine importance tier: first 2-3 are critical/high
                importance = "critical" if order <= 2 else ("high" if order <= 5 else "medium")
                target_prof = 0.85 if importance in ("critical", "high") else 0.75
                if not cs:
                    cs = CareerSkill(
                        career_id=career.id,
                        skill_id=sk.id,
                        weight=round(1.0 / num_skills, 3),
                        importance=importance,
                        target_proficiency=target_prof,
                        is_mandatory=True,
                        recommended_order=order
                    )
                    session.add(cs)
                else:
                    cs.importance = importance
                    cs.target_proficiency = target_prof
    await session.flush()

    # 4. Seed Resources & ResourceSkills
    for r_data in RESOURCES_SEED:
        stmt = select(Resource).where(Resource.slug == r_data["slug"])
        res = await session.execute(stmt)
        resource = res.scalar_one_or_none()
        if not resource:
            resource = Resource(
                slug=r_data["slug"],
                title=r_data["title"],
                description=r_data["description"],
                resource_type=r_data["resource_type"],
                url=r_data.get("url"),
                difficulty=r_data["difficulty"],
                estimated_minutes=r_data["estimated_minutes"],
                provider=r_data["provider"],
                is_interactive=r_data.get("is_interactive", False),
                content=r_data.get("content")
            )
            session.add(resource)
            await session.flush()
        else:
            resource.title = r_data["title"]
            resource.description = r_data["description"]
            resource.url = r_data.get("url", resource.url)
            resource.content = r_data.get("content", resource.content)
            resource.difficulty = r_data["difficulty"]
            resource.estimated_minutes = r_data["estimated_minutes"]
            resource.provider = r_data["provider"]
            resource.is_interactive = r_data.get("is_interactive", resource.is_interactive)


        for idx, sk_slug in enumerate(r_data.get("skills", [])):
            if sk_slug in skill_map:
                sk = skill_map[sk_slug]
                stmt = select(ResourceSkill).where(
                    ResourceSkill.resource_id == resource.id,
                    ResourceSkill.skill_id == sk.id
                )
                res = await session.execute(stmt)
                if not res.scalar_one_or_none():
                    rs = ResourceSkill(
                        resource_id=resource.id,
                        skill_id=sk.id,
                        relevance_score=1.0 if idx == 0 else 0.8,
                        relation_type="teaches",
                        is_primary=(idx == 0)
                    )
                    session.add(rs)
    await session.flush()

    # 5. Seed Assessments & Question Bank
    for c_slug, career in career_map.items():
        stmt = select(Assessment).where(Assessment.career_id == career.id)
        res = await session.execute(stmt)
        assessment = res.scalar_one_or_none()
        if not assessment:
            assessment = Assessment(
                career_id=career.id,
                title=f"{career.name} Diagnostic Assessment",
                description=f"Initial skill diagnostic quest evaluating competencies required for {career.name}.",
                total_questions=5,
                passing_score=70.0
            )
            session.add(assessment)
            await session.flush()

    for q_data in QUESTIONS_SEED:
        c_slug = q_data["career_slug"]
        sk_slug = q_data["skill_slug"]
        if c_slug in career_map and sk_slug in skill_map:
            career = career_map[c_slug]
            sk = skill_map[sk_slug]
            stmt = select(Assessment).where(Assessment.career_id == career.id)
            res = await session.execute(stmt)
            assessment = res.scalar_one_or_none()

            stmt_q = select(Question).where(
                Question.skill_id == sk.id,
                Question.question_text == q_data["question_text"]
            )
            res_q = await session.execute(stmt_q)
            if not res_q.scalar_one_or_none() and assessment:
                q = Question(
                    assessment_id=assessment.id,
                    skill_id=sk.id,
                    difficulty=q_data["difficulty"],
                    question_text=q_data["question_text"],
                    options=q_data["options"],
                    correct_answer_index=q_data["correct_answer_index"],
                    explanation=q_data["explanation"]
                )
                session.add(q)

    await session.commit()
    logger.info("PostgreSQL database seeding successfully completed.")

    # 6. Generate Vector Embeddings
    try:
        pipeline = EmbeddingPipelineService(session)
        emb_stats = await pipeline.generate_all(force=False)
        logger.info(f"Vector embeddings generated/verified: {emb_stats['total_upserted']} upserted, {emb_stats['total_skipped']} cached.")
    except Exception as e:
        logger.warning(f"Vector embedding generation during seeding encountered note: {e}")

async def run_seeder():
    from sqlalchemy import text
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE resources ADD COLUMN content TEXT;"))
        except Exception:
            pass
    async with AsyncSessionLocal() as session:
        await seed_database(session)

if __name__ == "__main__":
    asyncio.run(run_seeder())

