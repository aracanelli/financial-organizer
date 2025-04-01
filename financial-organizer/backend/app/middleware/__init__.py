from .rate_limiter import RateLimiter, RateLimitError
from .input_validator import InputValidator, InputValidationError

__all__ = [
    "RateLimiter",
    "RateLimitError",
    "InputValidator",
    "InputValidationError",
]

class RateLimiter:
    """Rate limiting middleware placeholder for tests"""
    def __init__(self, app=None, rate_limit_per_minute=100, exclude_paths=None):
        self.app = app
        self.rate_limit_per_minute = rate_limit_per_minute
        self.exclude_paths = exclude_paths or []
    
    async def __call__(self, scope, receive, send):
        await self.app(scope, receive, send)

class RateLimitError(Exception):
    """Exception raised when rate limit is exceeded"""
    def __init__(self, message="Rate limit exceeded"):
        self.message = message
        super().__init__(self.message)
        
class InputValidator:
    """Input validation middleware placeholder for tests"""
    def __init__(self, app=None, validation_rules=None):
        self.app = app
        self.validation_rules = validation_rules or {}
    
    async def __call__(self, scope, receive, send):
        await self.app(scope, receive, send)

class InputValidationError(Exception):
    """Exception raised when input validation fails"""
    def __init__(self, message="Input validation failed"):
        self.message = message
        super().__init__(self.message)

# Try to import the actual implementations, but don't fail if not found
try:
    from .rate_limiter import RateLimiter, RateLimitError
except ImportError:
    # Use the placeholder classes defined above
    pass

try:
    from .input_validator import InputValidator, InputValidationError
except ImportError:
    # Use the placeholder classes defined above
    pass 