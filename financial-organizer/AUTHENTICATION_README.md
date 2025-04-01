# Authentication System Guide

## Overview
The Financial Organizer application uses JWT (JSON Web Token) based authentication. This system allows users to register accounts and login to access their financial data.

## API Endpoints

### Registration
- Endpoint: `POST /api/auth/register`
- Payload:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "full_name": "User's Full Name"
  }
  ```
- Response: User object without password

### Login
- Endpoint: `POST /api/auth/login`
- Payload (form data):
  ```
  username: user@example.com
  password: securepassword
  ```
- Response: Access token and token type

## Troubleshooting Registration Issues

If you're having trouble with registration, here are some common issues and solutions:

### 1. Database Tables Not Created

The most common issue is that the database tables do not exist. You can fix this by:

```bash
# Run the initialization SQL script
docker cp init_db.sql financial-organizer-postgres-1:/tmp/init_db.sql
docker-compose exec postgres psql -U financialuser -d financialdb -f /tmp/init_db.sql
```

### 2. Configuration Issues

Make sure your `.env` file has the correct database configuration:

```
POSTGRES_USER=financialuser
POSTGRES_PASSWORD=securepassword
POSTGRES_DB=financialdb
```

### 3. Port Configuration

If you encounter the error `TypeError: argument 'port': 'str' object cannot be interpreted as an integer`, make sure to convert the port to an integer in the configuration:

```python
@validator("DATABASE_URL", pre=True)
def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
    if isinstance(v, str):
        return v
    return PostgresDsn.build(
        scheme="postgresql",
        username=values.get("POSTGRES_USER"),
        password=values.get("POSTGRES_PASSWORD"),
        host=values.get("POSTGRES_HOST"),
        port=int(values.get("POSTGRES_PORT", 5432)),  # Convert port to int
        path=f"/{values.get('POSTGRES_DB') or ''}",
    )
```

## Testing Authentication

You can test the authentication system using the provided test scripts:

```bash
# Run the registration test
python backend/tests/manual_test_register.py
```

## Frontend Authentication

The frontend uses a context-based authentication system:

1. The `AuthContext` provides login, register, and logout functions
2. These functions communicate with the backend API
3. After successful login, the JWT token is stored in localStorage
4. The token is added to request headers for authenticated API calls 