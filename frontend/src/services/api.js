import axios from "axios";

export const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 1000,
    withCredentials: true,
});

// Добавляем интерсептор для автоматической подстановки токена
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;