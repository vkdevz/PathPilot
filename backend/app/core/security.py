import hashlib
import secrets
import time
import logging
from typing import Dict, Any, Optional
import jwt
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("pathpilot.security")

def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a unique salt.
    """
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """
    Verifies a plain password against a stored PBKDF2-HMAC-SHA256 hash.
    """
    if not hashed_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 2:
            return False
        salt, stored_hash = parts
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return secrets.compare_digest(key.hex(), stored_hash)
    except Exception:
        return False

def create_access_token(user_id: str, email: str, display_name: Optional[str] = None, expires_in_days: int = 7) -> str:
    """
    Generates a cryptographically signed HS256 JWT access token for an authenticated user.
    """
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "role": "authenticated",
        "aud": "authenticated",
        "iat": now,
        "exp": now + (expires_in_days * 86400),
        "user_metadata": {"full_name": display_name or email.split("@")[0]}
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verifies and decodes an Auth JWT access token.
    Extracts the user's UUID ('sub'), email, and metadata.
    """
    # Allow mock/test tokens in DEV_MODE or test environment
    if (settings.DEV_MODE or settings.TESTING) and token.startswith("dev-token-"):
        uid = token.replace("dev-token-", "")
        return {
            "sub": uid,
            "email": f"{uid}@example.com",
            "user_metadata": {"full_name": f"Dev User ({uid})"}
        }

    # Handle standard JWT validation
    try:
        decoded = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return decoded
    except jwt.ExpiredSignatureError:
        logger.warning("Auth token has expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
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
    Utility to generate valid signed JWTs for testing suites.
    """
    return create_access_token(user_id=user_id, email=email, display_name=f"Test User {user_id}")

