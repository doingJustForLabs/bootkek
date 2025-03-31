import axios from "axios";

export const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 1000,
    withCredentials: true,
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('Ошибка авторизации');
      }
      return Promise.reject(error);
    }
  );
  
  export default API;