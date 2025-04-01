import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token exists and is valid on component mount
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token hasn't expired
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token has expired
          localStorage.removeItem('token');
          setCurrentUser(null);
        } else {
          // Set up axios headers for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          fetchCurrentUser();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // This would ideally call a /me endpoint to get current user details
      // For now we'll just use the token data
      const token = localStorage.getItem('token');
      if (token) {
        const user = jwtDecode(token);
        setCurrentUser(user);
        return user; // Return the user object
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError(error.message);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { email });
      
      // Create form data object using URLSearchParams for x-www-form-urlencoded format
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI OAuth expects 'username'
      formData.append('password', password);
      
      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Login response received:', response.status);
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user data with token
      const user = await fetchCurrentUser();
      
      console.log('Login successful, currentUser set:', !!user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.post('/api/auth/register', {
        email,
        password,
        full_name: fullName,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.detail || 'Failed to register');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 