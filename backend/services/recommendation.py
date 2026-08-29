from typing import List, Dict, Any

def generate_recommendations(
    career_skills: List[Dict[str, Any]],
    user_skill_scores: Dict[str, float],
    disliked_skills: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate dynamic personalized learning recommendations based on:
    1. Weak topic score (< 50%) -> High priority recommendation
    2. Missing prerequisites -> Unlocks foundation before advanced topics
    3. Completed/Strong prerequisites -> Next logical learning step
    4. Recommendation feedback -> Suppress disliked recommendations
    """
    disliked_skills = set(disliked_skills or [])
    recommendations = []
    
    # Sort skills by level
    sorted_skills = sorted(career_skills, key=lambda s: s.get("level", 1))
    skill_by_id = {s["id"]: s for s in sorted_skills}

    for skill in sorted_skills:
        skill_id = skill["id"]
        if skill_id in disliked_skills:
            continue

        score = user_skill_scores.get(skill_id, 0.0)
        prereqs = skill.get("prerequisites", [])
        
        # Check prerequisites status
        prereqs_met = True
        weak_prereq_name = None
        for p_id in prereqs:
            p_score = user_skill_scores.get(p_id, 0.0)
            if p_score < 50.0:
                prereqs_met = False
                weak_prereq_name = skill_by_id.get(p_id, {}).get("name", p_id)
                break

        # Priority & reason calculation
        if score > 0 and score < 50.0:
            # Topic was assessed as weak
            reason = f"Recommended because your assessment score in {skill['name']} is {score:.0f}% (Weak Area)."
            priority = "High"
            action = "Strengthen Skill"
            recommendations.append({
                "skill_id": skill_id,
                "skill_name": skill["name"],
                "category": skill["category"],
                "priority": priority,
                "reason": reason,
                "action": action,
                "estimated_minutes": skill.get("estimated_minutes", 90),
                "current_score": score
            })
        elif score >= 50.0 and score < 80.0:
            # Topic was assessed as moderate
            reason = f"Recommended because improving {skill['name']} from {score:.0f}% will unlock your Career Readiness goal."
            priority = "Medium"
            action = "Practice & Master"
            recommendations.append({
                "skill_id": skill_id,
                "skill_name": skill["name"],
                "category": skill["category"],
                "priority": priority,
                "reason": reason,
                "action": action,
                "estimated_minutes": skill.get("estimated_minutes", 60),
                "current_score": score
            })
        elif score == 0.0 and prereqs_met:
            # Unlocked next topic
            reason = f"Recommended because you have mastered the prerequisites for {skill['name']}."
            priority = "Medium"
            action = "Start New Skill"
            recommendations.append({
                "skill_id": skill_id,
                "skill_name": skill["name"],
                "category": skill["category"],
                "priority": priority,
                "reason": reason,
                "action": action,
                "estimated_minutes": skill.get("estimated_minutes", 120),
                "current_score": score
            })
        elif score == 0.0 and not prereqs_met and weak_prereq_name:
            # Locked topic explanation
            pass

    # Sort recommendations: High priority first, then by score lowest to highest
    priority_map = {"High": 0, "Medium": 1, "Low": 2}
    recommendations.sort(key=lambda r: (priority_map.get(r["priority"], 3), r["current_score"]))

    return recommendations[:6]
