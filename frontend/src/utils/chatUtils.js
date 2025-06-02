// utils/chatUtils.js
export const findOrCreateDirectChat = async (otherUserId, currentId, chats, createChat, navigate, setMessage) => {
    const existingChat = chats.find(chat =>
        chat.participants_profiles &&
        chat.participants_profiles.length === 2 &&
        chat.participants_profiles.some(profile => profile.user_id === otherUserId) &&
        chat.participants_profiles.some(profile => profile.user_id === currentId)
    );

    if (existingChat) {
        navigate(`/chats/${existingChat.id}`);
        if (setMessage) {
            setMessage.info('Личный чат с этим пользователем уже существует.', 3);
        }
        return existingChat.id;
    } else {
        try {
            const response = await createChat({
                user_ids: [otherUserId, currentId],
                name: ""
            });
            navigate(`/chats/${response.data.id}`);
            return response.data.id;
        } catch (error) {
            if (setMessage) {
                setMessage.error("Не удалось создать личный чат");
            }
            console.error("Ошибка при создании личного чата:", error);
            return null;
        }
    }
};