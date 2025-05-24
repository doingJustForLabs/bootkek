import AuthService from "../services/auth.service.js";
import { setAccessToken } from "../utils/token.js";
import {makeAutoObservable} from "mobx";

class AuthStore {

    currentId = null;
    isAuthenticated = false;
    loading = false;

    constructor() {
        makeAutoObservable(this);
        this.loadAuthFromStorage();
    }

    setCurrentId(id, authenticated) {
        this.currentId = parseInt(id, 10);
        this.isAuthenticated = authenticated;
        this.saveAuthToStorage();
    }

    setLoading(loading) {
        this.loading = loading;
    }

    saveAuthToStorage() {
        localStorage.setItem('currentId', this.currentId);
        localStorage.setItem('isAuthenticated', this.isAuthenticated);
    }

    loadAuthFromStorage() {
        const storedId = localStorage.getItem('currentId');
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedId) {
            this.currentId = parseInt(storedId, 10);
        }
        if (storedAuth === 'true') {
            this.isAuthenticated = true;
        }
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