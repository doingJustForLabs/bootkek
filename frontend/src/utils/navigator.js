let navigate = null;

export const setNavigator = (navFn) => {
    navigate = navFn;
};

export const goTo = (...args) => {
    if (!navigate) {
        console.error("Navigator is not set!");
        return;
    }
    navigate(...args);
};

export const goToProfile = (userId) => {
    if (!navigate) {
        console.error("Navigator is not set!");
        return;
    }
    navigate(`/profile/${userId}`);
}

export const goToChat = (chatId) => {
    if (!navigate) {
        console.error("Navigator is not set!");
        return;
    }
    navigate(`/chats/${chatId}`);
}