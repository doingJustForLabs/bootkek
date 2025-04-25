import AuthService from "../services/AuthService.js";
import { setAccessToken } from "./utils/token.js";

export default class AuthStore {

    static async login(email, password) {
        const response = await AuthService.login(email, password);
        setAccessToken(response.data.access_token);
        return response;
    }

    static async register(email, password, passwordRepeat) {
        const response = await AuthService.register(email, password, passwordRepeat);
        setAccessToken(response.data.access_token);
        return response;
    }
}
