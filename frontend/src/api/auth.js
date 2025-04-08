// src/api/auth.js
import API from '../services/API';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });

      // Проверяем структуру ответа
      if (!response.data?.access_token) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem('access_token', response.data.access_token);

      // Сохраняем токен в localStorage (вместо кук)
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Опционально: вызываем logout на сервере
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      // Удаляем токены из localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  getMe: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("No token found");

      const response = await API.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Извлекаем данные из response.data.detail
      const userData = response.data.detail || response.data;

      if (!userData?.id) {
        throw new Error('ID пользователя не получен');
      }

      return userData;

    } catch (error) {
      console.error("Failed to fetch user data:", {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error("No refresh token");

      const response = await API.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      if (!response.data?.access_token) {
        throw new Error("Invalid refresh response");
      }

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