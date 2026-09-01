import logging
from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_supabase_token
from app.models.user import User, LearnerProfile

logger = logging.getLogger("pathpilot.auth")

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency that extracts and validates the Supabase Auth Bearer token.
    Automatically syncs and retrieves the User record and LearnerProfile from PostgreSQL.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Expected 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    token_data = verify_supabase_token(token)
    user_id = token_data.get("sub")
    email = token_data.get("email") or f"{user_id}@example.com"
    user_metadata = token_data.get("user_metadata", {})
    display_name = user_metadata.get("full_name") or user_metadata.get("name") or "Learner"

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing subject identifier ('sub').",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Query or create user in PostgreSQL
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=user_id,
            email=email,
            display_name=display_name
        )
        db.add(user)
        await db.flush()

        # Create default learner profile
        profile = LearnerProfile(
            user_id=user.id,
            xp=0,
            streak_days=1,
            experience_level="beginner",
            learning_pace="moderate",
            preferred_format="interactive",
            weekly_hours_goal=5
        )
        db.add(profile)
        await db.flush()
        logger.info(f"Created new user and profile in PostgreSQL: {user.id} ({email})")

    return user

async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Optional auth dependency for endpoints that support both anonymous and authenticated access.
    """
    if not authorization:
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except HTTPException:
        return None

def verify_user_ownership(current_user: User, resource_user_id: str) -> None:
    """
    Ensures that an authenticated user can only access their own private resources.
    """
    if current_user.id != resource_user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you do not have permission to access or modify this resource.",
        )

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Ensures the authenticated user has administrative privileges.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrative privileges required."
        )
    return current_user
