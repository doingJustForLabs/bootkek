import axios from "axios";

export const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 1000,
    withCredentials: true,
});

// Добавляем интерсептор для автоматической подстановки токена
// API.interceptors.request.use((config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

API.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !error.config._retry) {
        try {
          // Отправляем запрос без тела, полагаясь на куки
          const refreshResponse = await API.get("/auth/refresh", { 
            withCredentials: true 
          });
          
          const { access_token } = refreshResponse.data;
          localStorage.setItem("access_token", access_token);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return API(error.config);
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

export default API;