import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "PathPilot AI"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development")
    DEV_MODE: bool = Field(default=False)
    TESTING: bool = Field(default=False)
    
    # PostgreSQL / Supabase Database URL
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:54322/postgres"
    )
    SYNC_DATABASE_URL: Optional[str] = None
    
    # Supabase Configuration
    SUPABASE_URL: str = Field(default="https://xyzcompany.supabase.co")
    SUPABASE_ANON_KEY: str = Field(default="mock-anon-key")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(default=None)
    SUPABASE_JWT_SECRET: str = Field(default="super-secret-jwt-token-key-for-development-mode-1234567890")
    
    # LLM & Embedding Settings
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://pathpilot.ai",
        "https://*.vercel.app"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
