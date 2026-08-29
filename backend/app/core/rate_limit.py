import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.core.config import settings

logger = logging.getLogger("pathpilot.rate_limit")

class InMemoryRateLimiter:
    """
    Sliding window in-memory rate limiter compatible with MVP / single-instance
    and multi-worker Render deployments without requiring external Redis.
    """
    def __init__(self):
        # Map: key -> list of timestamp floats
        self._records: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int]:
        """
        Checks whether the request is allowed under the sliding window limit.
        Returns (is_allowed, retry_after_seconds).
        """
        now = time.time()
        cutoff = now - window_seconds
        
        # Prune old timestamps
        timestamps = [ts for ts in self._records[key] if ts > cutoff]
        self._records[key] = timestamps
        
        if len(timestamps) >= max_requests:
            oldest = timestamps[0]
            retry_after = max(1, int(oldest + window_seconds - now))
            return False, retry_after
        
        self._records[key].append(now)
        return True, 0

    def reset(self):
        self._records.clear()

limiter = InMemoryRateLimiter()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI / Starlette middleware applying endpoint-specific rate limits.
    """
    async def dispatch(self, request: Request, call_next):
        # Bypass rate limiting in test suite or if disabled
        if getattr(settings, "TESTING", False) or request.headers.get("X-Test-Bypass-Rate-Limit") == "true":
            return await call_next(request)

        # Skip health check endpoints
        path = request.url.path
        if path.startswith("/health") or path.endswith("/health") or path.startswith("/docs") or path.startswith("/openapi.json"):
            return await call_next(request)

        # Identify client by Authorization Bearer token or client IP
        auth_header = request.headers.get("Authorization", "")
        client_ip = request.client.host if request.client else "unknown_client"
        client_key = auth_header if auth_header else client_ip

        # Configure tier-specific limits (requests per 60 seconds)
        # Auth endpoints: 30 req/min
        # AI & Chat: 40 req/min
        # Recommendations & Search: 60 req/min
        # General: 200 req/min
        if "/auth" in path:
            max_reqs = 30
            rule = "auth"
        elif "/ai" in path:
            max_reqs = 40
            rule = "ai"
        elif "/recommendations" in path or "/retrieval" in path:
            max_reqs = 60
            rule = "rec_search"
        else:
            max_reqs = 200
            rule = "general"

        rate_key = f"{rule}:{client_key}"
        allowed, retry_after = limiter.is_allowed(rate_key, max_requests=max_reqs, window_seconds=60)

        if not allowed:
            logger.warning(f"Rate limit exceeded for {client_key} on {path} ({rule}: {max_reqs}/min)")
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Too many requests. Please retry in a few moments.",
                    "retry_after": retry_after
                },
                headers={"Retry-After": str(retry_after)}
            )

        response = await call_next(request)
        return response
