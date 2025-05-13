import AuthService from "../services/auth.service.js";

export function setAccessToken(token) {
    localStorage.setItem("accessToken", token);
}

export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export async function checkAccessToken(error, retryRequest, params) {
    if (error.response && error.response.status === 401) {
        const refreshResponse = await AuthService.refresh();
        setAccessToken(refreshResponse.data.access_token);
        return await retryRequest(...params);
    } else {
        throw error;
    }
}