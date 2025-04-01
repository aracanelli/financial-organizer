import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.app.services import auth_service
from app.app.db.models import User
from app.app.schemas.auth import UserCreate, Token
from app.app.core.security import create_access_token

def test_register_user(client: TestClient):
    """Test creating a new user via the /register endpoint"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword",
            "full_name": "New User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert "hashed_password" not in data

def test_login_user(client: TestClient, test_user: User):
    """Test logging in a user via the /login endpoint"""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_user_invalid_credentials(client: TestClient, test_user: User):
    """Test logging in with invalid credentials should fail"""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_test_token(client: TestClient, test_user: User):
    """Test the /test-token endpoint with a valid token"""
    token = create_access_token(subject=test_user.id)
    response = client.get(
        "/api/v1/auth/test-token",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["id"] == test_user.id

def test_test_token_invalid(client: TestClient):
    """Test the /test-token endpoint with an invalid token"""
    response = client.get(
        "/api/v1/auth/test-token",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials" 