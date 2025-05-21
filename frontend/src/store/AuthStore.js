import AuthService from "../services/auth.service.js";
import { setAccessToken } from "../utils/token.js";
import {makeAutoObservable} from "mobx";

class AuthStore {

    currentId = null;

    constructor() {
        makeAutoObservable(this);
    }

    setCurrentId(id) {
        this.currentId = id;
    }

    async login(email, password) {
        const response = await AuthService.login(email, password);
        setAccessToken(response.data.access_token);
        return response;
    }

    async logout () {
        return await AuthService.logout();
    }

    async register(email, password, passwordRepeat) {
        const response = await AuthService.register(email, password, passwordRepeat);
        setAccessToken(response.data.access_token);
        return response;
    }
}

export default new AuthStore();
