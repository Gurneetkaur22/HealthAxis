import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response.data?.message || 'Session expired';
      if (message.includes('expired') || message.includes('invalid')) {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
