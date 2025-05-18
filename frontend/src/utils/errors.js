import {goTo} from "./navigator.js";
import Message from "./messages.js";

export function wrapHandleError(func) {
    return async function () {
        try {
            return await func.apply(this);
        } catch (error) {
            const message = error?.response?.data?.detail || 'Ошибка.';
            if (message === 'Ошибка.') console.error(error);
            Message.error(message);
            if (error.response?.status === 401) {
                goTo('/');
            }
            throw error;
        }
    };
}