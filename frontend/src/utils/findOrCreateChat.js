import {goToChat} from "utils/navigator.js";
import Message from "utils/messages.js";
import ChatService from "services/chat.service.js";
import {getCurrentId} from "utils/currentId.js";

export const findOrCreateDirectChat = async (targetUserId) => {

    const currentId = getCurrentId();

    const response = await ChatService.getChatsWithProfiles(currentId);
    const chats = response.data;
    console.log(response);
    const existingChat = chats.find(chat =>
        chat.participants_profiles &&
        chat.participants_profiles.length === 2 &&
        chat.participants_profiles.some(profile => profile.user_id === targetUserId) &&
        chat.participants_profiles.some(profile => profile.user_id === currentId)
    );

    if (existingChat) {
        console.log(existingChat);
        goToChat(existingChat.id);
    } else {
        try {
            ChatService.createChat({
                user_ids: [targetUserId, currentId],
                name: ""
            }).then((response) => {console.log(response); goToChat(response.data.id)});
        } catch (error) {
            Message.error("Не удалось создать личный чат");
            console.error("Ошибка при создании личного чата:", error);
        }
    }
};