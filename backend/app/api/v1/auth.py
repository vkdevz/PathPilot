from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, LearnerProfile
from app.schemas.user import UserResponse, UserSyncRequest, UserRegisterRequest, UserLoginRequest, AuthTokenResponse
from app.services.learner_service import LearnerService
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication & User"])

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Registers a new learner account with hashed password and generates a signed JWT token.
    """
    clean_email = req.email.lower().strip()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )
    if not req.password or len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters in length."
        )

    # Check if user already exists
    existing = await db.execute(select(User).where(User.email == clean_email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )

    # Create new User
    pwd_hash = hash_password(req.password)
    display_name = req.display_name.strip() if req.display_name else clean_email.split("@")[0]
    user = User(
        email=clean_email,
        password_hash=pwd_hash,
        display_name=display_name
    )
    db.add(user)
    await db.flush()

    # Create initial LearnerProfile
    profile = LearnerProfile(
        user_id=user.id,
        target_career_id=req.target_career_id or "data-scientist",
        xp=0,
        streak_days=1,
        experience_level="beginner",
        learning_pace="moderate",
        preferred_format="interactive",
        weekly_hours_goal=5
    )
    db.add(profile)
    await db.commit()

    token = create_access_token(user.id, user.email, user.display_name)
    learner_service = LearnerService(db)
    user_response = await learner_service.get_user_profile(user.id)

    return AuthTokenResponse(
        access_token=token,
        token_type="Bearer",
        user=user_response
    )

@router.post("/login", response_model=AuthTokenResponse)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticates a learner via email & password and issues a signed JWT access token.
    """
    clean_email = req.email.lower().strip()
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Verify password if set
    if user.password_hash:
        if not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password.",
                headers={"WWW-Authenticate": "Bearer"}
            )
    else:
        # If user existed from seeder without password, set password on first login
        user.password_hash = hash_password(req.password)
        await db.commit()

    token = create_access_token(user.id, user.email, user.display_name)
    learner_service = LearnerService(db)
    user_response = await learner_service.get_user_profile(user.id)

    return AuthTokenResponse(
        access_token=token,
        token_type="Bearer",
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Returns the authenticated user's profile and current progression.
    """
    learner_service = LearnerService(db)
    user = await learner_service.get_user_profile(current_user.id)
    return user

@router.post("/sync", response_model=UserResponse)
async def sync_user(
    req: UserSyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Syncs display name and metadata into PostgreSQL.
    """
    if req.display_name:
        current_user.display_name = req.display_name
    if req.avatar_url:
        current_user.avatar_url = req.avatar_url
    await db.flush()
    learner_service = LearnerService(db)
    return await learner_service.get_user_profile(current_user.id)
