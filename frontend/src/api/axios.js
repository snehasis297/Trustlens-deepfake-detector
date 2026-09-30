import axios from 'axios';

// Base URL: in development or docker, fallback to '' which proxies to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Secure in-memory token store (Never stored in localStorage to mitigate XSS attack vectors)
let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => {
  return inMemoryToken;
};

// Request interceptor injecting Bearer JWT token from memory
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handling unauthenticated or expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear in-memory token on unauthorized response
      inMemoryToken = null;
    }
    return Promise.reject(error);
  }
);

export default api;
