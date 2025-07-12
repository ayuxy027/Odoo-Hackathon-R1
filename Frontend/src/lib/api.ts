import axios from 'axios';

// API instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: false,
});

// Auth state management
let currentAuth: { username: string; password: string } | null = null;

export const setAuth = (auth: { username: string; password: string } | null) => {
  currentAuth = auth;
};

export const getAuth = () => currentAuth;

// Request interceptor to add auth headers
api.interceptors.request.use((config) => {
  if (currentAuth) {
    config.headers.username = currentAuth.username;
    config.headers.password = currentAuth.password;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      setAuth(null);
    }
    return Promise.reject(error);
  }
);

export default api; 