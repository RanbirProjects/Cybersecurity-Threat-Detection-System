import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
};

// Threats API
export const threatsAPI = {
  getAll: (params = {}) => api.get('/threats', { params }),
  getById: (id) => api.get(`/threats/${id}`),
  create: (threatData) => api.post('/threats', threatData),
  update: (id, threatData) => api.put(`/threats/${id}`, threatData),
  delete: (id) => api.delete(`/threats/${id}`),
  getStatistics: (params = {}) => api.get('/threats/statistics', { params }),
  getByTimeRange: (startDate, endDate, params = {}) => 
    api.get('/threats/time-range', { params: { startDate, endDate, ...params } }),
  addNote: (id, note) => api.post(`/threats/${id}/notes`, { content: note }),
  assignTo: (id, userId) => api.put(`/threats/${id}/assign`, { userId }),
  updateStatus: (id, status) => api.put(`/threats/${id}/status`, { status }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
  update: (id, notificationData) => api.put(`/notifications/${id}`, notificationData),
  delete: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  getUnread: () => api.get('/notifications/unread'),
  getStatistics: (params = {}) => api.get('/notifications/statistics', { params }),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  generateApiToken: (name) => api.post('/users/api-tokens', { name }),
  revokeApiToken: (token) => api.delete(`/users/api-tokens/${token}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 