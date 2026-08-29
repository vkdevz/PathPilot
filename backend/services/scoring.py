from typing import List, Dict, Any

STRONG_THRESHOLD = 80.0
MODERATE_THRESHOLD = 50.0

def calculate_assessment_score(answers: List[Dict[str, Any]], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    answers: list of dicts with {"question_id": str, "selected_option": int}
    questions: list of question dicts from DB
    """
    q_map = {q["id"]: q for q in questions}
    topic_totals = {}
    topic_corrects = {}

    total_correct = 0
    total_questions = len(answers)

    for ans in answers:
        q_id = ans.get("question_id")
        selected = ans.get("selected_option")
        q = q_map.get(q_id)
        if not q:
            continue

        skill_id = q["skill_id"]
        skill_name = q["skill_name"]

        if skill_id not in topic_totals:
            topic_totals[skill_id] = {"name": skill_name, "count": 0}
            topic_corrects[skill_id] = 0

        topic_totals[skill_id]["count"] += 1

        if selected == q["correct_answer"]:
            topic_corrects[skill_id] += 1
            total_correct += 1

    overall_score = round((total_correct / max(total_questions, 1)) * 100, 1)

    topic_scores = []
    strong_topics = []
    moderate_topics = []
    weak_topics = []

    for skill_id, info in topic_totals.items():
        correct = topic_corrects[skill_id]
        total = info["count"]
        score_pct = round((correct / max(total, 1)) * 100, 1)

        if score_pct >= STRONG_THRESHOLD:
            strength_level = "Strong"
            strong_topics.append({"skill_id": skill_id, "name": info["name"], "score": score_pct})
        elif score_pct >= MODERATE_THRESHOLD:
            strength_level = "Moderate"
            moderate_topics.append({"skill_id": skill_id, "name": info["name"], "score": score_pct})
        else:
            strength_level = "Weak"
            weak_topics.append({"skill_id": skill_id, "name": info["name"], "score": score_pct})

        topic_scores.append({
            "skill_id": skill_id,
            "skill_name": info["name"],
            "score": score_pct,
            "strength_level": strength_level,
            "correct_count": correct,
            "total_count": total
        })

    return {
        "overall_score": overall_score,
        "topic_scores": topic_scores,
        "strong_topics": strong_topics,
        "moderate_topics": moderate_topics,
        "weak_topics": weak_topics
    }
