import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Login from '../pages/Login';

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Login Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockedNavigate.mockReset();
  });
  
  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ loading: false, error: null, login: jest.fn() }}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  test('shows validation errors when form is submitted empty', async () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ loading: false, error: null, login: jest.fn() }}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
  
  test('calls login function with correct values when form is submitted', async () => {
    const mockLogin = jest.fn().mockResolvedValue(false);
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ loading: false, error: null, login: mockLogin }}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
  
  test('redirects to homepage on successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(true);
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthContext.Provider value={{ loading: false, error: null, login: mockLogin }}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });
  
  test('shows error message when login fails', async () => {
    const mockLogin = jest.fn().mockResolvedValue(false);
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ loading: false, error: 'Invalid credentials', login: mockLogin }}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
  
  test('disables submit button and shows loading indicator during login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(false);
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ loading: true, error: null, login: mockLogin }}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: '' });
    expect(submitButton).toBeDisabled();
    expect(submitButton.querySelector('svg')).toBeInTheDocument();
  });
}); 