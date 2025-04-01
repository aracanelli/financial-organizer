import re
from typing import Dict, List, Union, Any, Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class InputValidationError(Exception):
    def __init__(self, detail: str):
        self.detail = detail

class InputValidator(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        validation_rules: Dict[str, Dict[str, Any]] = None,
    ):
        super().__init__(app)
        self.validation_rules = validation_rules or {}
        
        # Common regex patterns for validation
        self.patterns = {
            "email": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
            "card_number": r"^\d{13,19}$",
            "expiry_date": r"^(0[1-9]|1[0-2])\/([0-9]{2})$",
            "date": r"^\d{4}-\d{2}-\d{2}$",
        }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only validate POST and PUT requests
        if request.method not in ["POST", "PUT"]:
            return await call_next(request)
        
        # Get the path for matching rules
        path = request.url.path
        
        # Check if we have rules for this path
        for rule_path, rules in self.validation_rules.items():
            if re.match(rule_path, path):
                try:
                    # Get JSON body
                    body = await request.json()
                    
                    # Apply validation rules
                    errors = self.validate_body(body, rules)
                    
                    if errors:
                        return JSONResponse(
                            status_code=422,
                            content={"detail": errors},
                        )
                except ValueError:
                    # If body is not valid JSON
                    return JSONResponse(
                        status_code=400,
                        content={"detail": "Invalid JSON body"},
                    )
        
        # Continue with the request
        return await call_next(request)
    
    def validate_body(self, body: Dict, rules: Dict) -> List[str]:
        """Validate request body against rules."""
        errors = []
        
        for field, rule in rules.items():
            # Check if field is required
            if rule.get("required", False) and field not in body:
                errors.append(f"Field '{field}' is required")
                continue
            
            # Skip validation if field is not present and not required
            if field not in body:
                continue
            
            value = body[field]
            
            # Check type
            if "type" in rule:
                if rule["type"] == "string" and not isinstance(value, str):
                    errors.append(f"Field '{field}' must be a string")
                elif rule["type"] == "number" and not isinstance(value, (int, float)):
                    errors.append(f"Field '{field}' must be a number")
                elif rule["type"] == "integer" and not isinstance(value, int):
                    errors.append(f"Field '{field}' must be an integer")
                elif rule["type"] == "boolean" and not isinstance(value, bool):
                    errors.append(f"Field '{field}' must be a boolean")
            
            # Check pattern
            if "pattern" in rule and isinstance(value, str):
                if not re.match(rule["pattern"], value):
                    errors.append(f"Field '{field}' has invalid format")
            
            # Check predefined patterns
            if "format" in rule and isinstance(value, str):
                pattern = self.patterns.get(rule["format"])
                if pattern and not re.match(pattern, value):
                    errors.append(f"Field '{field}' has invalid {rule['format']} format")
            
            # Check enum values
            if "enum" in rule:
                if value not in rule["enum"]:
                    errors.append(f"Field '{field}' must be one of: {', '.join(rule['enum'])}")
            
            # Check min/max for numbers
            if isinstance(value, (int, float)):
                if "minimum" in rule and value < rule["minimum"]:
                    errors.append(f"Field '{field}' must be at least {rule['minimum']}")
                if "maximum" in rule and value > rule["maximum"]:
                    errors.append(f"Field '{field}' must be at most {rule['maximum']}")
            
            # Check min/max length for strings
            if isinstance(value, str):
                if "minLength" in rule and len(value) < rule["minLength"]:
                    errors.append(f"Field '{field}' must be at least {rule['minLength']} characters")
                if "maxLength" in rule and len(value) > rule["maxLength"]:
                    errors.append(f"Field '{field}' must be at most {rule['maxLength']} characters")
        
        return errors 