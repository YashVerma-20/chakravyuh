import axios from 'axios';

const api = axios.create({
  // UPDATE: Add a fallback to localhost so it doesn't fail if the env var is missing
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token
api.interceptors.request.use(
    (config) => {
        // Keep your existing key name 'authToken'
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Optional: Prevent redirect loop if already on login page
            if (window.location.pathname !== '/judge/login' && window.location.pathname !== '/') {
                 window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
