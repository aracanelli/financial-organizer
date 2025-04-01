import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Default auth context for testing
const defaultAuthContext = {
  currentUser: null,
  loading: false,
  error: null,
  login: jest.fn().mockResolvedValue(true),
  register: jest.fn().mockResolvedValue(true),
  logout: jest.fn(),
};

// Render with router
export const renderWithRouter = (
  ui,
  {
    path = '/',
    route = '/',
    history = [route],
    authContext = defaultAuthContext,
  } = {}
) => {
  return {
    ...render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter initialEntries={history}>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    ),
    history,
  };
};

// Mock navigate function for testing
export const createMockNavigate = () => {
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));
  return mockNavigate;
};

// Helper to wait for async events
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0)); 