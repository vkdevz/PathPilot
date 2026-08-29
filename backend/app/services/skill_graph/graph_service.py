import logging
from typing import Dict, List, Set, Optional, Tuple, Any
from dataclasses import dataclass, field
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.skill_repository import SkillRepository
from app.repositories.career_repository import CareerRepository
from app.models.skill import Skill, SkillPrerequisite

logger = logging.getLogger("pathpilot.skill_graph")

@dataclass
class GraphValidationResult:
    is_valid: bool
    total_skills: int
    total_edges: int
    cycles_detected: List[List[str]] = field(default_factory=list)
    orphan_skills: List[str] = field(default_factory=list)
    missing_references: List[str] = field(default_factory=list)
    duplicate_edges: List[str] = field(default_factory=list)
    inactive_skills: List[str] = field(default_factory=list)

class SkillGraphService:
    """
    In-memory DAG engine and topological graph manager for PathPilot skills.
    Performs recursive prerequisite traversal, cycle detection, downstream unlocking calculations,
    and administrative graph integrity validation without external graph databases.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.skill_repo = SkillRepository(db)
        self.career_repo = CareerRepository(db)
        self._skills_by_id: Dict[str, Skill] = {}
        self._skills_by_slug: Dict[str, Skill] = {}
        self._adj_downstream: Dict[str, List[str]] = {}     # prereq_id -> [dependent_skill_ids]
        self._adj_prerequisites: Dict[str, List[str]] = {}   # skill_id -> [prereq_skill_ids]
        self._initialized = False

    async def initialize(self, force_refresh: bool = False) -> None:
        """
        Loads all active skills and builds the adjacency structures.
        """
        if self._initialized and not force_refresh:
            return

        all_skills = await self.skill_repo.get_all(active_only=False)
        self._skills_by_id = {s.id: s for s in all_skills}
        self._skills_by_slug = {s.slug: s for s in all_skills}
        self._adj_downstream = {s.id: [] for s in all_skills}
        self._adj_prerequisites = {s.id: [] for s in all_skills}

        for skill in all_skills:
            if skill.prerequisites:
                for p in skill.prerequisites:
                    prereq_id = p.prerequisite_skill_id
                    if prereq_id in self._skills_by_id:
                        self._adj_prerequisites[skill.id].append(prereq_id)
                        if prereq_id not in self._adj_downstream:
                            self._adj_downstream[prereq_id] = []
                        self._adj_downstream[prereq_id].append(skill.id)

        self._initialized = True

    def get_skill(self, identifier: str) -> Optional[Skill]:
        """Resolves a skill by UUID or slug."""
        if identifier in self._skills_by_id:
            return self._skills_by_id[identifier]
        if identifier in self._skills_by_slug:
            return self._skills_by_slug[identifier]
        # Check normalized slug variations
        alt_slug = identifier.replace("_", "-") if "_" in identifier else identifier.replace("-", "_")
        return self._skills_by_slug.get(alt_slug)

    def get_all_skills(self) -> List[Skill]:
        return list(self._skills_by_id.values())

    def get_direct_prerequisites(self, skill_id: str) -> List[Skill]:
        """Returns direct 1-hop upstream prerequisite skills."""
        prereq_ids = self._adj_prerequisites.get(skill_id, [])
        return [self._skills_by_id[pid] for pid in prereq_ids if pid in self._skills_by_id]

    def get_transitive_prerequisites(self, skill_id: str) -> List[Tuple[Skill, int]]:
        """
        Traverses upstream DAG ancestors using BFS.
        Returns list of (Skill, depth) where depth >= 1.
        """
        visited: Dict[str, int] = {}
        queue: List[Tuple[str, int]] = [(pid, 1) for pid in self._adj_prerequisites.get(skill_id, [])]

        while queue:
            curr_id, depth = queue.pop(0)
            if curr_id not in visited or depth < visited[curr_id]:
                visited[curr_id] = depth
                for parent_id in self._adj_prerequisites.get(curr_id, []):
                    if parent_id not in visited:
                        queue.append((parent_id, depth + 1))

        results = []
        for sid, depth in visited.items():
            if sid in self._skills_by_id and sid != skill_id:
                results.append((self._skills_by_id[sid], depth))

        # Sort by depth ascending, then level
        results.sort(key=lambda x: (x[1], x[0].level))
        return results

    def get_direct_downstream(self, skill_id: str) -> List[Skill]:
        """Returns direct 1-hop downstream dependent skills."""
        down_ids = self._adj_downstream.get(skill_id, [])
        return [self._skills_by_id[did] for did in down_ids if did in self._skills_by_id]

    def get_transitive_downstream(self, skill_id: str) -> List[Tuple[Skill, int]]:
        """
        Traverses downstream DAG descendants using BFS.
        Returns list of (Skill, depth) where depth >= 1.
        """
        visited: Dict[str, int] = {}
        queue: List[Tuple[str, int]] = [(did, 1) for did in self._adj_downstream.get(skill_id, [])]

        while queue:
            curr_id, depth = queue.pop(0)
            if curr_id not in visited or depth < visited[curr_id]:
                visited[curr_id] = depth
                for child_id in self._adj_downstream.get(curr_id, []):
                    if child_id not in visited:
                        queue.append((child_id, depth + 1))

        results = []
        for sid, depth in visited.items():
            if sid in self._skills_by_id and sid != skill_id:
                results.append((self._skills_by_id[sid], depth))

        results.sort(key=lambda x: (x[1], x[0].level))
        return results

    def get_prerequisite_depth(self, skill_id: str) -> int:
        """
        Calculates the maximum depth of prerequisite chain for a skill.
        Foundation skills have depth 0.
        """
        transitive = self.get_transitive_prerequisites(skill_id)
        if not transitive:
            return 0
        return max(depth for _, depth in transitive)

    def is_foundation_skill(self, skill_id: str) -> bool:
        """
        Foundation skills have no prerequisites or are level 1-2.
        """
        prereqs = self._adj_prerequisites.get(skill_id, [])
        skill = self._skills_by_id.get(skill_id)
        if not prereqs:
            return True
        if skill and skill.category.lower() == "foundation":
            return True
        return False

    def calculate_downstream_impact(
        self,
        skill_id: str,
        career_skill_importance: Optional[Dict[str, float]] = None
    ) -> float:
        """
        Computes a graph-aware downstream impact score in [0.0, 1.0].
        A skill that unlocks multiple downstream skills (especially high importance career skills)
        receives a high impact score with distance decay factor 0.80^depth.
        """
        descendants = self.get_transitive_downstream(skill_id)
        if not descendants:
            return 0.0

        importance_map = career_skill_importance or {}
        total_impact = 0.0

        for desc_skill, depth in descendants:
            # Importance weight defaults to 0.5 (medium) if not in career
            base_importance = importance_map.get(desc_skill.id, 0.5)
            # Distance decay: 1st degree = 1.0, 2nd degree = 0.8, 3rd degree = 0.64
            decay = 0.80 ** (depth - 1)
            total_impact += base_importance * decay

        # Normalize score into [0.0, 1.0] (2.5+ impact points saturate to 1.0)
        return min(1.0, round(total_impact / 2.5, 4))

    def detect_cycles(self) -> List[List[str]]:
        """
        Executes Tarjan/DFS recursion stack cycle detection.
        Returns all cycle paths as lists of skill slugs.
        """
        cycles = []
        visited = set()
        rec_stack = []

        def dfs(curr_id: str, path: List[str]):
            visited.add(curr_id)
            rec_stack.append(curr_id)
            curr_slug = self._skills_by_id[curr_id].slug if curr_id in self._skills_by_id else curr_id

            for neighbor_id in self._adj_downstream.get(curr_id, []):
                if neighbor_id not in visited:
                    dfs(neighbor_id, path + [curr_slug])
                elif neighbor_id in rec_stack:
                    # Cycle found
                    neighbor_slug = self._skills_by_id[neighbor_id].slug if neighbor_id in self._skills_by_id else neighbor_id
                    cycle_subpath = path[path.index(neighbor_slug):] if neighbor_slug in path else path
                    cycles.append(cycle_subpath + [curr_slug, neighbor_slug])

            rec_stack.pop()

        for skill_id in self._skills_by_id:
            if skill_id not in visited:
                dfs(skill_id, [])

        return cycles

    async def validate_graph(self) -> GraphValidationResult:
        """
        Conducts a complete administrative and integrity audit of the skill graph.
        """
        await self.initialize()

        cycles = self.detect_cycles()
        missing_refs = []
        duplicate_edges = []
        orphan_skills = []
        inactive_skills = []
        total_edges = 0

        # Check all edges and nodes
        for skill_id, skill in self._skills_by_id.items():
            if not skill.is_active:
                inactive_skills.append(skill.slug)

            # Check self-prerequisite or missing
            prereq_ids = self._adj_prerequisites.get(skill_id, [])
            total_edges += len(prereq_ids)

            seen_p = set()
            for pid in prereq_ids:
                if pid == skill_id:
                    cycles.append([skill.slug, skill.slug])
                if pid not in self._skills_by_id:
                    missing_refs.append(f"{skill.slug} -> missing:{pid}")
                if pid in seen_p:
                    duplicate_edges.append(f"{skill.slug} -> {pid}")
                seen_p.add(pid)

            # Orphan check: 0 prereqs, 0 downstream, and 0 career associations
            down_ids = self._adj_downstream.get(skill_id, [])
            if not prereq_ids and not down_ids and not skill.career_associations:
                orphan_skills.append(skill.slug)

        is_valid = len(cycles) == 0 and len(missing_refs) == 0 and len(duplicate_edges) == 0

        return GraphValidationResult(
            is_valid=is_valid,
            total_skills=len(self._skills_by_id),
            total_edges=total_edges,
            cycles_detected=cycles,
            orphan_skills=orphan_skills,
            missing_references=missing_refs,
            duplicate_edges=duplicate_edges,
            inactive_skills=inactive_skills
        )
