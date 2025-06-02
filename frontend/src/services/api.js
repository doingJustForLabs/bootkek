import axios from "axios";

export const API_URL = "http://localhost:8000";

const API = axios.create(
    {
        withCredentials: true,
        baseURL: API_URL
    }
)

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export default API;