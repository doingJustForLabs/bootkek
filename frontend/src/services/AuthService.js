import API from "../http/api.js"

export default class AuthService {

    static login = (email, password) => {
        return API.post("/auth/login", {
            email: email,
            password: password
        })
    }

    static register = (email, password, passwordRepeat) => {
        return API.post("/auth/register", {
            email: email,
            password: password,
            password_repeat: passwordRepeat
        })
    }
}