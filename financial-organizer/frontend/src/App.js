import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Cards from './pages/Cards';
import NotFound from './pages/NotFound';

// Components
import Navigation from './components/Navigation';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      <CssBaseline />
      {currentUser && <Navigation />}
      <Container component="main" className="container">
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          
          <Route path="/transactions/:id" element={
            <ProtectedRoute>
              <TransactionDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/cards" element={
            <ProtectedRoute>
              <Cards />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </>
  );
}

export default App; 