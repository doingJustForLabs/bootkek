import API from "./api.js"

export default class AuthService {

    static async login (email, password){
        return API.post("/auth/login", {
            email: email,
            password: password
        })
    }

    static async refresh () {
        return API.get("/auth/refresh", {});
    }

    static async register (email, password, passwordRepeat) {
        return API.post("/auth/register", {
            email: email,
            password: password,
            password_repeat: passwordRepeat
        })
    }
}