"""
Adaptive Learning Engine — Configuration & Pedagogical Thresholds
Centralizes mathematical constants, reliability weights, and decay factors.
"""

from typing import Dict

# Algorithm Metadata
ALGORITHM_VERSION = "adaptive-v1.0"

# Evidence Reliability Hierarchy (0.0 - 1.0)
EVIDENCE_RELIABILITY_WEIGHTS: Dict[str, float] = {
    "ASSESSMENT": 1.00,             # Rigorous verified diagnostic or comprehensive exam
    "PROJECT": 0.85,                # Capstone or verified coding project evaluation
    "QUIZ": 0.75,                   # Module-level quiz or practice assessment
    "RESOURCE_COMPLETION": 0.50,    # Resource marked done (effort signal, not proof of mastery)
    "REPEATED_PERFORMANCE": 0.90,   # Consistency across repeated evaluation sessions
    "SELF_REPORT": 0.35,            # Subjective onboarding self-assessment
    "FEEDBACK": 0.30,               # Subjective perceived difficulty rating
    "INFERRED": 0.20,               # Cold-start or heuristic inference
}

# Confidence Multipliers by Evidence Type
EVIDENCE_BASE_CONFIDENCE: Dict[str, float] = {
    "ASSESSMENT": 0.90,
    "PROJECT": 0.85,
    "QUIZ": 0.80,
    "RESOURCE_COMPLETION": 0.60,
    "REPEATED_PERFORMANCE": 0.95,
    "SELF_REPORT": 0.40,
    "FEEDBACK": 0.35,
    "INFERRED": 0.20,
}

# Proficiency Update Parameters
MAX_PROFICIENCY_ALPHA = 0.65       # Maximum single-step update magnitude
MIN_PROFICIENCY_ALPHA = 0.05       # Minimum update magnitude for weak evidence
RECENCY_HALF_LIFE_DAYS = 30.0      # Exponential decay half-life in days

# Mastery Classification Thresholds
MASTERY_PROMOTED_THRESHOLD = 0.85  # 85% proficiency required for MASTERED
MASTERY_MIN_CONFIDENCE = 0.75      # 75% epistemic confidence required for MASTERED
NEAR_MASTERY_THRESHOLD = 0.75      # 75% - 84% proficiency
PRACTICING_THRESHOLD = 0.50        # 50% - 74% proficiency
DEVELOPING_THRESHOLD = 0.20        # 20% - 49% proficiency

# Struggle Detection Thresholds
STRUGGLE_CONSECUTIVE_FAILURES = 2  # >= 2 consecutive scores < 0.45 triggers struggle
STRUGGLE_SCORE_THRESHOLD = 0.45    # Below 45% counts as a failure
STRUGGLE_CONFIDENCE_THRESHOLD = 0.60 # At least 60% confidence before altering roadmap
STRUGGLE_RETRY_COUNT = 3           # 3+ attempts with sub-passing performance

# Learning Pace Thresholds (Velocity in estimated hours vs actual completed units)
PACE_FAST_VELOCITY = 1.4           # Completes >= 1.4x faster than estimated
PACE_SLOW_VELOCITY = 0.6           # Takes <= 0.6x baseline velocity

# Roadmap Mutation Safety Thresholds
MIN_EVIDENCE_FOR_ROADMAP_MUTATION = 2  # Must have >= 2 pieces of verified evidence
PREREQUISITE_MASTERY_GATE = 0.70       # 70% proficiency required to unlock downstream
REINFORCEMENT_PROBATION_COUNT = 2      # Number of practice items to inject upon struggle
