import axios from "axios";
import { useAuth } from "./AuthContext";

export const API_URL = "http://127.0.0.1:8000/api";

const API = axios.create(
    {
        withCredentials: true,
        baseURL: API_URL
    }
)

const { accessToken } = useAuth();
API.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${accessToken}`;
})
