import os
import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("pathpilot.auth")

# Firebase Admin SDK initialization
firebase_initialized = False

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
    private_key = os.getenv("FIREBASE_PRIVATE_KEY")

    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
        logger.info("Firebase Admin initialized using service account file.")
    elif project_id and client_email and private_key:
        cert_dict = {
            "type": "service_account",
            "project_id": project_id,
            "private_key_id": "key-id",
            "private_key": private_key.replace("\\n", "\n"),
            "client_email": client_email,
            "client_id": "client-id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        cred = credentials.Certificate(cert_dict)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
        logger.info("Firebase Admin initialized using environment variables.")
    else:
        # Initialize default app if standard environment is set
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
            firebase_initialized = True
            logger.info("Firebase Admin initialized using default credentials.")
except Exception as e:
    logger.warning(f"Firebase Admin SDK initialization skipped/failed: {e}")

DEV_MODE = os.getenv("DEV_MODE", "true").lower() in ("true", "1", "t")

def verify_firebase_token(id_token: str) -> Dict[str, Any]:
    """
    Verifies a Firebase ID token using firebase_admin.auth.verify_id_token()
    Returns decoded token dictionary containing 'uid', 'email', 'name', etc.
    """
    # Allow development tokens in DEV_MODE for offline/test environments
    if DEV_MODE and id_token.startswith("dev-token-"):
        uid = id_token.replace("dev-token-", "")
        return {
            "uid": uid,
            "email": f"{uid}@example.com",
            "name": f"Dev User ({uid})"
        }

    if not firebase_initialized:
        if DEV_MODE:
            # Fallback for dev mode when Firebase SDK is unconfigured
            return {
                "uid": id_token if id_token and id_token != "null" else "dev-user-123",
                "email": "dev-user@example.com",
                "name": "Dev User"
            }
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Admin SDK is not initialized."
        )

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Failed to verify Firebase ID token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID token: {str(e)}"
        )

def get_current_user_uid(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency extracting and verifying Firebase UID from Authorization header.
    """
    if not authorization:
        if DEV_MODE:
            return "dev-user-123"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing."
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        if DEV_MODE:
            return authorization
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'."
        )

    id_token = parts[1]
    decoded = verify_firebase_token(id_token)
    return decoded.get("uid", "dev-user-123")
