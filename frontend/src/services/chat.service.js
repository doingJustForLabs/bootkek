import API from "./api";
import { withTokenRetry } from "../utils/token"; // Убедитесь, что путь правильный

class ChatService {
    static async getChatsWithProfiles(userId) {
        return await withTokenRetry(API.get, `/chats/${userId}/with_profiles`);
    }

    static async createChat(payload) {
        return await withTokenRetry(API.post, '/chats', payload);
    }

    static async getChatDetails(chatId, userId) {
        return await withTokenRetry(API.get, `/chats/${userId}/with_profiles?chat_id=${chatId}`);
    }

    static async deleteChat(chatId){
        return API.delete(`/chats?chat_id=${chatId}`);
    }

    // Добавьте другие методы для работы с чатами по мере необходимости
    // Например:
    // static async getChatMessages(chatId) {
    //     return await withTokenRetry(API.get, `/chats/${chatId}/messages`);
    // }

    // static async sendMessage(chatId, content) {
    //     return await withTokenRetry(API.post, `/chats/${chatId}/messages`, { content });
    // }


}

export default ChatService;