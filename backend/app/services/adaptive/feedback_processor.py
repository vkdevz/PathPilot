import re
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger("pathpilot.adaptive.feedback")

# Allowed canonical feedback categories
VALID_DIFFICULTY_FEEDBACK = {"TOO_EASY", "APPROPRIATE", "TOO_HARD"}
VALID_FORMAT_PREFERENCES = {"PROJECTS", "VIDEOS", "READING", "INTERACTIVE_LABS", "QUIZZES"}
VALID_SENTIMENT = {"POSITIVE", "NEUTRAL", "NEGATIVE"}

class FeedbackProcessor:
    """
    Processes explicit feedback and interprets natural language learner feedback.
    Converts qualitative comments into structured pedagogical signals without directly mutating proficiency.
    """

    @staticmethod
    def classify_natural_language_feedback(comment: str) -> Dict[str, Any]:
        """
        Deterministic rule-based NLP classifier mapping unstructured comments into structured pedagogical signals.
        """
        text = comment.lower().strip()
        
        difficulty_signal = "APPROPRIATE"
        confidence = 0.70
        format_preference = None
        sentiment = "NEUTRAL"
        tags = []

        # 1. Difficulty classification
        if any(w in text for w in ["too hard", "very hard", "too difficult", "impossible", "struggling with this", "confusing", "lost", "way over my head"]):
            difficulty_signal = "TOO_HARD"
            sentiment = "NEGATIVE"
            confidence = 0.88
            tags.append("needs_easier_resource")
        elif any(w in text for w in ["too easy", "trivial", "very basic", "boring", "already know this", "breeze", "simplistic"]):
            difficulty_signal = "TOO_EASY"
            sentiment = "POSITIVE" if "breeze" in text else "NEUTRAL"
            confidence = 0.85
            tags.append("needs_challenging_resource")

        # 2. Format preferences
        if any(w in text for w in ["prefer project", "more projects", "hands-on", "build something", "practical"]):
            format_preference = "PROJECTS"
            tags.append("prefers_projects")
        elif any(w in text for w in ["prefer video", "video lectures", "visual explanation"]):
            format_preference = "VIDEOS"
            tags.append("prefers_videos")
        elif any(w in text for w in ["prefer reading", "documentation", "articles", "text"]):
            format_preference = "READING"
            tags.append("prefers_reading")
        elif any(w in text for w in ["interactive", "lab", "practice code", "coding exercise"]):
            format_preference = "INTERACTIVE_LABS"
            tags.append("prefers_labs")

        # 3. Overall sentiment
        if any(w in text for w in ["great", "awesome", "loved it", "helpful", "clear", "enjoyed"]):
            sentiment = "POSITIVE"
        elif any(w in text for w in ["terrible", "waste of time", "bad", "useless", "hated"]):
            sentiment = "NEGATIVE"

        return {
            "original_comment": comment,
            "difficulty_signal": difficulty_signal,
            "format_preference": format_preference,
            "sentiment": sentiment,
            "confidence": confidence,
            "pedagogical_tags": tags
        }

    @classmethod
    def compute_difficulty_adjustment(
        cls,
        feedback_history: list[str]
    ) -> float:
        """
        Calculates a difficulty offset in range [-0.25, +0.25] based on aggregate recent feedback.
        """
        if not feedback_history:
            return 0.0

        hard_count = sum(1 for f in feedback_history if f.upper() in ["TOO_HARD", "DIFFICULT"])
        easy_count = sum(1 for f in feedback_history if f.upper() in ["TOO_EASY", "TRIVIAL"])
        total = len(feedback_history)

        if total == 0:
            return 0.0

        ratio = (easy_count - hard_count) / total
        return round(max(-0.25, min(0.25, ratio * 0.20)), 3)
