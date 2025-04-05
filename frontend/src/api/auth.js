// src/api/auth.js
import API from '../services/API';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });

      // Сохраняем токен в localStorage (вместо кук)
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token); // Если есть
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      // Удаляем токены из localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Опционально: вызываем logout на сервере
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await API.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Извлекаем данные из response.data.detail
      const userData = response.data.detail;

      if (!userData?.id) {
        throw new Error('ID пользователя не получен');
      }

      console.log('Данные пользователя:', userData);
      return userData;

    } catch (error) {
      console.error('Ошибка получения данных:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await API.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      // Обновляем токены
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
};