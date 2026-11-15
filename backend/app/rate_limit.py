import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status


class RateLimiter:
    """Sliding-window counter kept in memory.

    Good for a single API process. When running several workers or hosts, move
    this to a shared store (e.g. Redis) so limits apply across all of them.
    """

    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def _prune(self, key: str, now: float) -> deque[float]:
        hits = self._hits[key]
        while hits and hits[0] <= now - self.window:
            hits.popleft()
        return hits

    def check(self, key: str) -> None:
        """Raises 429 if `key` has used up its allowance."""
        with self._lock:
            hits = self._prune(key, time.monotonic())
            if len(hits) >= self.limit:
                retry = int(hits[0] + self.window - time.monotonic()) + 1
                raise HTTPException(
                    status.HTTP_429_TOO_MANY_REQUESTS,
                    "Too many attempts. Please wait a few minutes and try again.",
                    headers={"Retry-After": str(max(retry, 1))},
                )

    def hit(self, key: str) -> None:
        with self._lock:
            self._prune(key, time.monotonic()).append(time.monotonic())

    def reset(self, key: str) -> None:
        with self._lock:
            self._hits.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._hits.clear()


def client_ip(request: Request) -> str:
    # Behind a reverse proxy, run uvicorn with --proxy-headers so this is the real client.
    return request.client.host if request.client else "unknown"


# Failed logins per account+IP, and per IP across all accounts (credential stuffing).
login_failures = RateLimiter(limit=5, window_seconds=15 * 60)
login_failures_by_ip = RateLimiter(limit=30, window_seconds=15 * 60)
registrations = RateLimiter(limit=10, window_seconds=60 * 60)
