from typing import Dict, Any, List

def answer_user_query(query: str, user_context: Dict[str, Any]) -> str:
    query_lower = query.lower()
    user_name = user_context.get("name", "Learner")
    career_name = user_context.get("career_name", "Data Scientist")
    weak_topics = user_context.get("weak_topics", [])
    overall_score = user_context.get("overall_score", 62)

    weak_topic_names = [t.get("name") or t.get("skill_name") for t in weak_topics]
    weak_str = ", ".join(weak_topic_names) if weak_topic_names else "Machine Learning and Statistics"

    if "why" in query_lower and ("weak" in query_lower or "score" in query_lower):
        return (
            f"Hello {user_name}! Your overall career readiness for **{career_name}** is currently **{overall_score}%**.\n\n"
            f"Your score indicates weak performance in: **{weak_str}**.\n\n"
            f"**Why this happened:** In your recent assessment, you struggled with conceptual scenario questions in these topics. "
            f"For example, in Statistics, p-value interpretations and distribution skewness were missed. "
            f"I recommend spending 20 minutes today on the *Statistics Fundamentals* module to quickly boost your score!"
        )
    elif "next" in query_lower or "study" in query_lower or "recommend" in query_lower:
        return (
            f"Based on your goal to become a **{career_name}**, here is your optimal next focus:\n\n"
            f"1. 🎯 **Primary Priority**: Review **{weak_str}** (Currently marked as Weak area).\n"
            f"2. ⚡ **Quick Win**: Complete the 20-minute daily mission on your staircase roadmap.\n"
            f"3. 🚀 **Next Unlock**: Once you hit 75%+ in core statistics, you will unlock Deep Learning Neural Nets!\n\n"
            f"Would you like a quick practice question on {weak_topic_names[0] if weak_topic_names else 'Statistics'}?"
        )
    elif "practice" in query_lower or "question" in query_lower or "quiz" in query_lower:
        return (
            f"Here is a quick practice question for **{career_name}**:\n\n"
            f"**Q:** In a dataset with extreme outliers, which metric is most resistant to extreme high values?\n"
            f"A) Mean\n"
            f"B) Median\n"
            f"C) Standard Deviation\n"
            f"D) Range\n\n"
            f"*Hint: Think about which metric splits the sorted data exactly in half!*"
        )
    else:
        return (
            f"I'm your **PathPilot AI Assistant**! I'm tracking your roadmap for **{career_name}**.\n\n"
            f"Right now your overall readiness is **{overall_score}%**.\n"
            f"I can help you with:\n"
            f"- Explaining why specific skills are marked as Weak or Moderate\n"
            f"- Suggesting targeted practice questions\n"
            f"- Breaking down complex tech concepts step-by-step\n\n"
            f"How can I help you accelerate your learning today?"
        )
