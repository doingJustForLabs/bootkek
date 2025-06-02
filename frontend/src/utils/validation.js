export default class Validator {
    static validateName(_, value){
        if (!value) {
            return Promise.reject('Введите имя');
        }
        if (!/^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(value)) {
            return Promise.reject('Имя может содержать только буквы');
        }
        return Promise.resolve();
    }

    static validateUsername(_, value){
        if (!value) {
            return Promise.reject('Введите никнейм');
        }
        if (value.length < 5) {
            return Promise.reject('Никнейм должен быть не короче 5 символов');
        }
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
            return Promise.reject('Никнейм может содержать только латинские буквы и цифры');
        }
        return Promise.resolve();
    }

    static validatePassword(_, value){
        if (!value) {
            return Promise.reject('Введите пароль');
        }
        if (value.length < 6) {
            return Promise.reject('Пароль должен быть не короче 6 символов');
        }
        return Promise.resolve();
    }
}