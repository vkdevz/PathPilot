import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.core.database import Base, get_db
from app.core.security import create_test_jwt
from app.main import app
from app.seed.seeder import seed_database
from app.models.user import User, LearnerProfile
from app.models.career import Career
from app.core.config import settings
settings.TESTING = True

# In-memory SQLite async engine for isolated fast test runs
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )

    async with session_factory() as session:
        # Seed initial database
        await seed_database(session)
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers() -> dict:
    token = create_test_jwt("user-test-001", "user1@example.com")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_user1() -> dict:
    token = create_test_jwt("user-test-001", "user1@example.com")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_user2() -> dict:
    token = create_test_jwt("user-test-002", "user2@example.com")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    res = await db_session.execute(select(Career))
    career = res.scalars().first()
    
    # Check if user already exists
    res_u = await db_session.execute(select(User).where(User.id == "user-test-001"))
    user = res_u.scalar_one_or_none()
    if not user:
        user = User(
            id="user-test-001",
            email="user1@example.com",
            display_name="Test Learner 1"
        )
        db_session.add(user)
        await db_session.flush()

    res_p = await db_session.execute(select(LearnerProfile).where(LearnerProfile.user_id == user.id))
    profile = res_p.scalar_one_or_none()
    if not profile:
        profile = LearnerProfile(
            user_id=user.id,
            target_career_id=career.id if career else None,
            experience_level="beginner",
            learning_pace="moderate",
            preferred_format="interactive",
            weekly_hours_goal=5,
            xp=120,
            streak_days=3
        )
        db_session.add(profile)
        await db_session.flush()

    return user
