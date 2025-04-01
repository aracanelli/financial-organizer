import requests
import json
import sys
import random

def test_register():
    """
    Simple script to test the registration endpoint.
    """
    # Generate a random email to avoid conflicts
    random_suffix = random.randint(1000, 9999)
    
    # Registration data
    user_data = {
        "email": f"testuser{random_suffix}@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    print(f"Attempting to register user: {user_data['email']}")
    
    try:
        # Make the request to the register endpoint
        response = requests.post(
            "http://localhost:8000/api/auth/register",
            json=user_data,
            timeout=10
        )
        
        # Check status code
        print(f"Status Code: {response.status_code}")
        
        # Print response
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Raw Response: {response.text}")
        
        return response.status_code == 200, user_data
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, None

def test_login(email, password):
    """
    Simple script to test the login endpoint.
    """
    # Login data (note: uses form data, not JSON)
    login_data = {
        "username": email,  # OAuth2 expects 'username' field
        "password": password
    }
    
    try:
        # Make the request to the login endpoint
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            data=login_data,  # Use data= for form data
            timeout=10
        )
        
        # Check status code
        print(f"Status Code: {response.status_code}")
        
        # Print response
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Raw Response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing Registration")
    print("-" * 50)
    success, user_data = test_register()
    
    if success and user_data:
        print("\nRegistration successful! Now testing login...")
        print("-" * 50)
        test_login(user_data["email"], user_data["password"])
    else:
        print("\nRegistration failed. Skipping login test.") 