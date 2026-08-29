import hashlib
from typing import List, Optional
from app.models.resource import Resource
from app.models.skill import Skill
from app.models.career import Career

class TextPreprocessor:
    """
    Structured text serialization and content-hashing for resources, skills, and careers.
    Ensures optimal semantic density and idempotent embedding updates.
    """

    @staticmethod
    def compute_hash(text: str) -> str:
        """Computes SHA-256 hash of prepared text for change detection."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    @classmethod
    def prepare_resource_text(
        cls,
        resource: Resource,
        skills: Optional[List[Skill]] = None
    ) -> str:
        """
        Serializes a learning resource into a rich semantic context string.
        """
        skill_names = [s.name for s in (skills or [])]
        skill_categories = list(set([s.category for s in (skills or []) if s.category]))

        skills_str = ", ".join(skill_names) if skill_names else "General Computer Science"
        categories_str = ", ".join(skill_categories) if skill_categories else "Technology"

        return (
            f"Resource Title: {resource.title}\n"
            f"Type: {resource.resource_type}\n"
            f"Difficulty: {resource.difficulty}\n"
            f"Provider: {resource.provider}\n"
            f"Estimated Duration: {resource.estimated_minutes} minutes\n"
            f"Interactive: {'Yes' if resource.is_interactive else 'No'}\n"
            f"Primary Skills: {skills_str}\n"
            f"Knowledge Domain: {categories_str}\n"
            f"Description: {resource.description}"
        )

    @classmethod
    def prepare_skill_text(
        cls,
        skill: Skill,
        prerequisites: Optional[List[Skill]] = None
    ) -> str:
        """
        Serializes a skill into a rich semantic representation.
        """
        prereq_names = [p.name for p in (prerequisites or [])]
        prereq_str = ", ".join(prereq_names) if prereq_names else "None (Foundational)"

        return (
            f"Skill Name: {skill.name}\n"
            f"Category: {skill.category}\n"
            f"Difficulty: {skill.difficulty or 'All Levels'}\n"
            f"Level: {skill.level}\n"
            f"Estimated Learning Time: {skill.estimated_minutes} minutes\n"
            f"Prerequisites: {prereq_str}\n"
            f"Description: {skill.description}"
        )

    @classmethod
    def prepare_career_text(
        cls,
        career: Career,
        required_skills: Optional[List[Skill]] = None
    ) -> str:
        """
        Serializes a career track into a rich semantic representation.
        """
        skill_names = [s.name for s in (required_skills or [])]
        skills_str = ", ".join(skill_names) if skill_names else "Various"

        return (
            f"Career Role: {career.name}\n"
            f"Category: {career.category}\n"
            f"Market Demand Score: {career.market_demand_score}/100\n"
            f"Salary Range: {career.salary_range or 'Competitive'}\n"
            f"Core Competencies Required: {skills_str}\n"
            f"Role Overview: {career.description}"
        )
