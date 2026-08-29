# PathPilot AI — Authentication Specification

## 1. Overview

PathPilot AI utilizes **Supabase Auth** for identity management and JWT-based session security.

```
+------------------+         1. Login / Sign Up        +-------------------+
|  Next.js Client  | ================================> | Supabase Auth API |
+------------------+ <-------------------------------- +-------------------+
         |                    2. Returns JWT Token
         |
         | 3. API Request with Header: "Authorization: Bearer <JWT>"
         v
+------------------+
| FastAPI Backend  |
+------------------+
         | 4. Decodes and verifies JWT signature & expiry via PyJWT
         | 5. Extracts `sub` (User UUID) and metadata
         | 6. Fetches/Syncs PostgreSQL `User` & `LearnerProfile`
         v
+------------------+
| PostgreSQL DB    | (Private data retrieved with WHERE user_id = current_user.id)
+------------------+
```

---

## 2. Token Security & Verification Policy

1. **Header Format**: All protected requests require an `Authorization` header formatted as:
   ```
   Authorization: Bearer <supabase_jwt_access_token>
   ```
2. **Asymmetric/Secret Decoding**:
   - In production, JWTs are verified against `SUPABASE_JWT_SECRET` using `HS256` or JWKS public keys.
   - Any expired, unparseable, or tampered token returns `HTTP 401 Unauthorized`.
3. **No Direct User ID Trust**:
   - The frontend never passes `user_id` as a trusted query parameter or body field for identification.
   - The backend dependency `get_current_user` derives the user identity strictly from the verified JWT `sub` claim.
4. **Ownership Verification**:
   - `verify_user_ownership(current_user, target_resource_user_id)` raises `HTTP 403 Forbidden` if a user attempts to view or modify another learner's learning path, feedback, or private assessments.
