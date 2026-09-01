import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.dependencies.auth import get_current_admin_user
from app.models.user import User, LearnerProfile
from app.models.progress import StudySession, Progress
from app.models.career import Career
from app.schemas.admin import AdminUserRecord, AdminOverviewStats, UserRoleUpdateRequest

logger = logging.getLogger("pathpilot.admin")

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/users", response_model=List[AdminUserRecord])
async def list_registered_users(
    search: str = Query(None, description="Search by name, email, or career"),
    role: str = Query(None, description="Filter by role ('learner', 'admin')"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve list of all registered clients/users with full learning and activity metrics.
    Protected: Admin role required.
    """
    stmt = (
        select(User)
        .options(
            selectinload(User.profile).selectinload(LearnerProfile.target_career),
            selectinload(User.study_sessions),
            selectinload(User.progress_logs)
        )
        .order_by(desc(User.created_at))
    )

    if role:
        stmt = stmt.where(User.role == role)

    if search:
        search_pattern = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            (func.lower(User.email).like(search_pattern)) |
            (func.lower(User.display_name).like(search_pattern))
        )

    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    users = list(result.scalars().all())

    records: List[AdminUserRecord] = []
    for u in users:
        prof = u.profile
        total_mins = sum(s.duration_minutes for s in u.study_sessions) if u.study_sessions else 0
        total_sessions = len(u.study_sessions) if u.study_sessions else 0
        total_completions = len([p for p in u.progress_logs if p.status == "completed"]) if u.progress_logs else 0

        target_career_name = None
        target_career_slug = None
        if prof and prof.target_career:
            target_career_name = prof.target_career.name
            target_career_slug = prof.target_career.slug

        records.append(
            AdminUserRecord(
                id=u.id,
                email=u.email,
                display_name=u.display_name or "Learner",
                role=u.role or "learner",
                target_career_name=target_career_name,
                target_career_slug=target_career_slug,
                experience_level=prof.experience_level if prof else "beginner",
                learning_pace=prof.learning_pace if prof else "moderate",
                weekly_hours_goal=prof.weekly_hours_goal if prof else 5,
                xp=prof.xp if prof else 0,
                streak_days=prof.streak_days if prof else 1,
                total_study_minutes=total_mins,
                total_study_sessions=total_sessions,
                total_completed_learning=total_completions,
                created_at=u.created_at,
                updated_at=u.updated_at
            )
        )

    return records

@router.get("/overview", response_model=AdminOverviewStats)
async def get_admin_overview(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve platform overview statistics across all registered users and learning activity.
    Protected: Admin role required.
    """
    # 1. Total Registered Users and Roles
    user_counts_stmt = select(User.role, func.count(User.id)).group_by(User.role)
    user_counts_res = await db.execute(user_counts_stmt)
    role_counts = {r[0]: r[1] for r in user_counts_res.all()}
    
    total_learners = role_counts.get("learner", 0)
    total_admins = role_counts.get("admin", 0)
    total_registered = sum(role_counts.values())

    # 2. Total XP from Profiles
    xp_sum_stmt = select(func.coalesce(func.sum(LearnerProfile.xp), 0))
    xp_sum_res = await db.execute(xp_sum_stmt)
    total_xp = int(xp_sum_res.scalar_one() or 0)

    # 3. Total Study Sessions & Minutes
    sessions_sum_stmt = select(
        func.count(StudySession.id),
        func.coalesce(func.sum(StudySession.duration_minutes), 0)
    )
    sessions_res = await db.execute(sessions_sum_stmt)
    sess_row = sessions_res.one()
    total_sessions = int(sess_row[0] or 0)
    total_mins = int(sess_row[1] or 0)

    # 4. Total Verified Completions
    completions_stmt = select(func.count(Progress.id)).where(Progress.status == "completed")
    comp_res = await db.execute(completions_stmt)
    total_completions = int(comp_res.scalar_one() or 0)

    # 5. Career Track Distribution
    career_dist_stmt = (
        select(Career.name, func.count(LearnerProfile.id))
        .join(LearnerProfile, LearnerProfile.target_career_id == Career.id)
        .group_by(Career.name)
        .order_by(desc(func.count(LearnerProfile.id)))
    )
    career_dist_res = await db.execute(career_dist_stmt)
    career_distribution = [
        {"career_name": r[0], "learner_count": r[1]}
        for r in career_dist_res.all()
    ]

    # 6. Recent Registrations (top 5)
    recent_users_stmt = (
        select(User)
        .options(
            selectinload(User.profile).selectinload(LearnerProfile.target_career),
            selectinload(User.study_sessions),
            selectinload(User.progress_logs)
        )
        .order_by(desc(User.created_at))
        .limit(5)
    )
    recent_res = await db.execute(recent_users_stmt)
    recent_users = list(recent_res.scalars().all())

    recent_records: List[AdminUserRecord] = []
    for u in recent_users:
        prof = u.profile
        recent_records.append(
            AdminUserRecord(
                id=u.id,
                email=u.email,
                display_name=u.display_name or "Learner",
                role=u.role or "learner",
                target_career_name=prof.target_career.name if prof and prof.target_career else None,
                target_career_slug=prof.target_career.slug if prof and prof.target_career else None,
                experience_level=prof.experience_level if prof else "beginner",
                learning_pace=prof.learning_pace if prof else "moderate",
                weekly_hours_goal=prof.weekly_hours_goal if prof else 5,
                xp=prof.xp if prof else 0,
                streak_days=prof.streak_days if prof else 1,
                total_study_minutes=sum(s.duration_minutes for s in u.study_sessions) if u.study_sessions else 0,
                total_study_sessions=len(u.study_sessions) if u.study_sessions else 0,
                total_completed_learning=len([p for p in u.progress_logs if p.status == "completed"]) if u.progress_logs else 0,
                created_at=u.created_at,
                updated_at=u.updated_at
            )
        )

    return AdminOverviewStats(
        total_registered_users=total_registered,
        total_learners=total_learners,
        total_admins=total_admins,
        total_xp_awarded=total_xp,
        total_study_minutes_logged=total_mins,
        total_study_sessions_logged=total_sessions,
        total_verified_completions=total_completions,
        career_distribution=career_distribution,
        recent_registrations=recent_records
    )

@router.patch("/users/{user_id}/role", response_model=AdminUserRecord)
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdateRequest,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user's role ('admin' or 'learner').
    Protected: Admin role required.
    """
    if payload.role not in ("admin", "learner"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin' or 'learner'."
        )

    stmt = (
        select(User)
        .options(
            selectinload(User.profile).selectinload(LearnerProfile.target_career),
            selectinload(User.study_sessions),
            selectinload(User.progress_logs)
        )
        .where(User.id == user_id)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found."
        )

    user.role = payload.role
    await db.commit()
    await db.refresh(user)

    prof = user.profile
    return AdminUserRecord(
        id=user.id,
        email=user.email,
        display_name=user.display_name or "Learner",
        role=user.role,
        target_career_name=prof.target_career.name if prof and prof.target_career else None,
        target_career_slug=prof.target_career.slug if prof and prof.target_career else None,
        experience_level=prof.experience_level if prof else "beginner",
        learning_pace=prof.learning_pace if prof else "moderate",
        weekly_hours_goal=prof.weekly_hours_goal if prof else 5,
        xp=prof.xp if prof else 0,
        streak_days=prof.streak_days if prof else 1,
        total_study_minutes=sum(s.duration_minutes for s in user.study_sessions) if user.study_sessions else 0,
        total_study_sessions=len(user.study_sessions) if user.study_sessions else 0,
        total_completed_learning=len([p for p in user.progress_logs if p.status == "completed"]) if user.progress_logs else 0,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
