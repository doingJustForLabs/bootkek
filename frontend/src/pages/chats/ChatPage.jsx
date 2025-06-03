import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavLayout from "../../components/layouts/NavLayout";
import ChatsList from "components/chats/ChatsList.jsx";
import ChatViewComponent from "components/chats/ChatViewComponent.jsx";
import { goToChat } from "utils/navigator.js";
import API from "services/api.js";
import { message } from "antd";
import { getCurrentId } from "utils/currentId.js";

const ChatPage = () => {
    const { chatId: chatIdFromUrl } = useParams();
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [currentId, setCurrentId] = useState(null);


    const fetchChats = async () => {
        if (!currentId) return;
        try {
            const response = await API.get(`/chats/${currentId}`);
            setChats(response.data || []);
        } catch (error) {
            console.error("Ошибка загрузки чатов:", error);
            message.error("Ошибка загрузки чатов");
        }
    };

    useEffect(() => {
        const id = getCurrentId();
        if (id) {
            setCurrentId(id);
        }
        fetchChats();
    }, [currentId]);

    // Синхронизация selectedChatId с URL
    useEffect(() => {
        if (chatIdFromUrl) {
            const id = Number(chatIdFromUrl);
            if (!isNaN(id) && id !== selectedChatId) {
                setSelectedChatId(id);
            }
        } else {
            setSelectedChatId(null);
        }
    }, [chatIdFromUrl]);

    const handleChatSelect = (id) => {
        if (id !== selectedChatId) {
            setSelectedChatId(id);
            goToChat(id);
        }
    };

    return (
        <NavLayout>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        backgroundColor: "#f4f4f4",
                        borderRadius: "50px",
                        padding: "16px",
                        display: "flex",
                        height: "80vh",
                        width: "80%",
                        boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <div
                        style={{
                            width: "25%",
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "auto",
                        }}
                    >
                        <ChatsList
                            chats={chats}
                            onChatSelect={handleChatSelect}
                            selectedChatId={selectedChatId}
                            onRefresh={fetchChats}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            marginLeft: "16px",
                            borderRadius: "30px",
                            backgroundColor: "#9fa8d3",
                            overflow: "hidden",
                        }}
                    >
                        {selectedChatId ? (
                            <ChatViewComponent
                                key={selectedChatId}
                                chatId={selectedChatId}
                                actions={{ fetchChats }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "#fff",
                                    fontSize: "1.2rem",
                                }}
                            >
                                Выберите чат слева
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </NavLayout>
    );
};

export default ChatPage;
