import logging
from typing import List, Set
from app.services.recommendation.types import ScoredCandidate

logger = logging.getLogger("pathpilot.recommendation.diversity_ranker")

class DiversityRanker:
    """
    Applies Maximal Marginal Relevance (MMR) and format coverage re-ranking to prevent redundancy.
    Calculates Intra-List Diversity (ILD) for telemetry and benchmark comparisons.
    """

    def __init__(self, lambda_param: float = 0.75):
        self.lambda_param = lambda_param

    def rank_and_diversify(
        self,
        candidates: List[ScoredCandidate],
        top_k: int = 10
    ) -> List[ScoredCandidate]:
        if not candidates:
            return []
        if len(candidates) <= 1:
            return candidates

        selected: List[ScoredCandidate] = []
        remaining = list(candidates)

        # 1. Pick highest composite scoring candidate as seed
        seed = max(remaining, key=lambda c: c.composite_score)
        selected.append(seed)
        remaining.remove(seed)

        # 2. Iterative MMR selection
        while remaining and len(selected) < top_k:
            best_candidate = None
            best_mmr = -999.0

            for cand in remaining:
                relevance = cand.composite_score / 100.0
                
                # Max similarity to already selected candidates
                max_sim = max(self._compute_candidate_similarity(cand, s) for s in selected)
                
                # MMR formula
                mmr = (self.lambda_param * relevance) - ((1.0 - self.lambda_param) * max_sim)
                cand.mmr_score = round(mmr, 4)

                if mmr > best_mmr:
                    best_mmr = mmr
                    best_candidate = cand

            if best_candidate:
                selected.append(best_candidate)
                remaining.remove(best_candidate)
            else:
                break

        return selected

    def calculate_intra_list_diversity(self, items: List[ScoredCandidate]) -> float:
        """
        Calculates Intra-List Diversity (ILD) across top recommendations.
        ILD = 2 / (K * (K - 1)) * sum_{i < j} (1 - Similarity(i, j))
        """
        n = len(items)
        if n <= 1:
            return 1.0

        total_distance = 0.0
        pairs_count = 0

        for i in range(n):
            for j in range(i + 1, n):
                sim = self._compute_candidate_similarity(items[i], items[j])
                dist = 1.0 - sim
                total_distance += dist
                pairs_count += 1

        if pairs_count == 0:
            return 1.0

        return round(total_distance / pairs_count, 4)

    def _compute_candidate_similarity(self, c1: ScoredCandidate, c2: ScoredCandidate) -> float:
        r1 = c1.candidate.resource
        r2 = c2.candidate.resource

        # 1. Skill overlap (Jaccard similarity)
        skills1 = {rs.skill_id for rs in r1.resource_skills}
        skills2 = {rs.skill_id for rs in r2.resource_skills}
        
        union_skills = skills1.union(skills2)
        intersection_skills = skills1.intersection(skills2)
        skill_sim = len(intersection_skills) / len(union_skills) if union_skills else 0.0

        # 2. Resource type overlap
        type_sim = 1.0 if r1.resource_type == r2.resource_type else 0.0

        # 3. Provider overlap
        provider_sim = 1.0 if r1.provider == r2.provider else 0.0

        # Combined item similarity
        return (0.6 * skill_sim) + (0.25 * type_sim) + (0.15 * provider_sim)
