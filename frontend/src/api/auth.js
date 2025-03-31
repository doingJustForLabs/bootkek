// src/api/auth.js
import API from '../services/api';

export const authAPI = {
  login: (email, password) => 
    API.post('/auth/login', { email, password }),

  logout: () => 
    API.post('/auth/logout'),

  getMe: () => 
    API.get('/auth/me').then(res => res.data.detail),

  register: (userData) => 
    API.post('/auth/signup', userData),

  resetPassword: (email) => 
    API.post('/auth/reset', { email }),
};