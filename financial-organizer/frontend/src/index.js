import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';

// Add a console log to verify initialization
console.log('Application initialized with updated API paths', new Date().toISOString());

// Add global monitoring for ALL axios requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Global FETCH intercepted:', args[0]);
  return originalFetch.apply(this, args);
};

// Monitor ALL axios instances by patching the prototype
const originalRequest = axios.Axios.prototype.request;
axios.Axios.prototype.request = function(...args) {
  console.log('Global AXIOS request intercepted:', args[0]?.url || args[0]);
  return originalRequest.apply(this, args);
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 