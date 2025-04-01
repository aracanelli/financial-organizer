import axios from 'axios';

// Create a new instance with default config
const API = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Log all requests
API.interceptors.request.use(config => {
  console.log('API utility making request to:', config.url);
  return config;
});

// Add auth token to requests if available
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log responses
API.interceptors.response.use(
  response => {
    console.log('API utility received successful response from:', response.config.url);
    return response;
  },
  error => {
    console.error('API utility request failed for:', error.config?.url, error);
    return Promise.reject(error);
  }
);

export default API; 