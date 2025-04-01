import time
from typing import Dict, Tuple, Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimitError(Exception):
    def __init__(self, detail: str):
        self.detail = detail

class RateLimiter(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        rate_limit_per_minute: int = 60,
        exclude_paths: Tuple[str] = (),
    ):
        super().__init__(app)
        self.rate_limit_per_minute = rate_limit_per_minute
        self.exclude_paths = exclude_paths
        self.requests: Dict[str, Dict] = {}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get current timestamp
        current_time = time.time()
        
        # Initialize or clean up expired requests
        if client_ip not in self.requests:
            self.requests[client_ip] = {"count": 0, "reset_time": current_time + 60}
        elif self.requests[client_ip]["reset_time"] <= current_time:
            self.requests[client_ip] = {"count": 0, "reset_time": current_time + 60}
        
        # Check if rate limit is exceeded
        if self.requests[client_ip]["count"] >= self.rate_limit_per_minute:
            # Calculate time until reset
            seconds_until_reset = int(self.requests[client_ip]["reset_time"] - current_time)
            
            # Return rate limit exceeded response
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded. Try again in {seconds_until_reset} seconds."
                },
                headers={
                    "X-RateLimit-Limit": str(self.rate_limit_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(self.requests[client_ip]["reset_time"])),
                    "Retry-After": str(seconds_until_reset),
                },
            )
        
        # Increment request count
        self.requests[client_ip]["count"] += 1
        
        # Calculate remaining requests
        remaining = self.rate_limit_per_minute - self.requests[client_ip]["count"]
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(self.rate_limit_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(self.requests[client_ip]["reset_time"]))
        
        return response 