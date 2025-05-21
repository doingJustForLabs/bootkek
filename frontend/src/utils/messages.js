import { makeAutoObservable } from "mobx";

class Message {
    messageApi = null;

    constructor() {
        makeAutoObservable(this);
    }

    setApi(api) {
        this.messageApi = api;
    }

    success(msg) {
        this.messageApi?.success({ content: msg });
    }

    error(msg) {
        if (msg === "Missing cookie 'refresh_token_cookie'.") msg = "Время сессии истекло."
        this.messageApi?.error({ content: msg });
    }

    info(msg) {
        this.messageApi?.info({ content: msg });
    }

    warning(msg) {
        this.messageApi?.warning({ content: msg });
    }
}

export default new Message();