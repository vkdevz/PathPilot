import logging
from typing import Dict, Any, Optional
import jwt
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("pathpilot.security")

def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verifies and decodes a Supabase Auth JWT access token.
    Extracts the user's Supabase UUID ('sub'), email, and metadata.
    """
    # Allow mock/test tokens in DEV_MODE or test environment
    if settings.DEV_MODE and token.startswith("dev-token-"):
        uid = token.replace("dev-token-", "")
        return {
            "sub": uid,
            "email": f"{uid}@example.com",
            "user_metadata": {"full_name": f"Dev User ({uid})"}
        }

    # Handle standard Supabase JWT validation
    try:
        # First attempt decoding with Supabase JWT secret
        # Supabase uses HS256 with project JWT secret by default
        decoded = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase aud is 'authenticated'
        )
        return decoded
    except jwt.ExpiredSignatureError:
        logger.warning("Supabase token has expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        # If in DEV_MODE, allow unverified decode as fallback for local mock frontend tokens
        if settings.DEV_MODE:
            try:
                unverified = jwt.decode(token, options={"verify_signature": False})
                return unverified
            except Exception:
                pass
        
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def create_test_jwt(user_id: str, email: str, role: str = "authenticated") -> str:
    """
    Utility to generate valid signed JWTs for testing suites without an external Supabase server.
    """
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "aud": "authenticated",
        "user_metadata": {"full_name": f"Test User {user_id}"}
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
