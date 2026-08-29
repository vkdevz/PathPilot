import pytest
from app.core.rate_limit import InMemoryRateLimiter

def test_rate_limiter_allows_under_limit():
    limiter = InMemoryRateLimiter()
    key = "test_client_1"
    
    # 5 requests under a limit of 10 should all succeed
    for _ in range(5):
        allowed, retry_after = limiter.is_allowed(key, max_requests=10, window_seconds=60)
        assert allowed is True
        assert retry_after == 0

def test_rate_limiter_blocks_over_limit():
    limiter = InMemoryRateLimiter()
    key = "test_client_2"
    
    # Send 3 allowed requests
    for _ in range(3):
        allowed, _ = limiter.is_allowed(key, max_requests=3, window_seconds=60)
        assert allowed is True
        
    # 4th request must be blocked
    allowed, retry_after = limiter.is_allowed(key, max_requests=3, window_seconds=60)
    assert allowed is False
    assert retry_after > 0
