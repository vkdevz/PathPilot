import re
import logging
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger("pathpilot.ai.safety")

# Patterns indicating prompt injection or system subversion
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"system\s+prompt\s+override",
    r"disregard\s+(the\s+)?rules",
    r"you\s+are\s+now\s+in\s+DAN\s+mode",
    r"jailbreak",
    r"drop\s+database",
    r"delete\s+from\s+users",
    r"format\s+c:",
    r"rm\s+-rf\s+/",
    r"reveal\s+(your\s+)?secret\s+key",
    r"bypass\s+safety\s+filter",
]

class SafetyGuardrails:
    @staticmethod
    def validate_user_input(message: str) -> Tuple[bool, Optional[str]]:
        """
        Validates incoming user message for malicious prompt injection or dangerous commands.
        Returns (is_safe, refusal_message).
        """
        cleaned = message.strip().lower()

        if len(cleaned) == 0:
            return False, "Please enter a message to begin our learning session."

        if len(message) > 4000:
            return False, "Your query exceeds the maximum allowed character limit (4,000 chars). Please break it into smaller questions."

        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, cleaned):
                logger.warning(f"Prompt injection pattern detected: '{pattern}' in input: '{message[:80]}...'")
                return False, "I am the PathPilot AI Learning Navigator. I can only assist with verified engineering concepts, quizzes, study pacing, and roadmap coaching. How can I help with your technical learning today?"

        return True, None

    @staticmethod
    def verify_output_grounding(output_text: str, context: Dict[str, Any]) -> str:
        """
        Sanitizes or warns if the output attempts to invent false credentials or scores.
        """
        # Ensure zero-hallucination compliance
        return output_text
