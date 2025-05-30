import React, { useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import NavLayout from "../../components/layouts/NavLayout";
import ChatsList from "components/ui/chats/ChatsList.jsx";
import ChatViewComponent from "components/ui/chats/ChatViewComponent.jsx";


const ChatPage = () => {
    const navigate = useNavigate();
    const { chatId: chatIdFromUrl } = useParams();
    const [selectedChatId, setSelectedChatId] = useState(Number(chatIdFromUrl) || null);
    
    console.log('ChatPage - chatIdFromUrl:', chatIdFromUrl);
    console.log('ChatPage - selectedChatId:', selectedChatId);

    useEffect(() => {
        // Сбрасываем selectedChatId, если chatIdFromUrl становится undefined или null
        if (!chatIdFromUrl) {
            setSelectedChatId(null);
            console.log('ChatPage - useEffect - selectedChatId сброшен на null');
        } else if (Number(chatIdFromUrl) !== selectedChatId) {
            setSelectedChatId(Number(chatIdFromUrl));
            console.log('ChatPage - useEffect - selectedChatId обновлен на:', Number(chatIdFromUrl));
        }
    }, [chatIdFromUrl, setSelectedChatId]);

    const handleChatSelect = (id) => {
        console.log('ChatPage - handleChatSelect - id:', id);
        if (id !== selectedChatId) {
            setSelectedChatId(id);
            navigate(`/chats/${id}`);
        } else {
            console.log('ChatPage - handleChatSelect - выбран тот же чат, ничего не делаем');
        }
    };

    return (
        <NavLayout>
            <div style={{
                display: "flex",
                width: "80%",
                justifyContent: "center",
                justifySelf: "center",
                alignSelf: "center",
                height: "100%",
                padding: "10vh 0 10vh 0",
                textAlign: "center"
            }}>
                <div style={{
                    backgroundColor: "#f4f4f4",
                    borderRadius: "30px",
                    padding: "16px",
                    display: "flex",
                    width: "100%"
                }}>
                    <div style={{
                    width: "25%",
                    display: "flex",
                    flexDirection: "column",
                    justifyItems: "center",
                }}>
                    <ChatsList
                        onChatSelect={handleChatSelect}
                        selectedChatId={selectedChatId}
                    />
                </div>

                    <div style={{
                        display: "flex",
                        flex: 1,
                        borderRadius: "30px",
                        backgroundColor: '#596acc',
                    }}>

                        {selectedChatId ? (
                            <ChatViewComponent key={selectedChatId} chatId={selectedChatId} />
                        ) :
                            null
                        }
                    </div>
                </div>
            </div>
        </NavLayout>
    )
};

// const ChatPage = () => {
//     const navigate = useNavigate();

//     return (
//         <div className="h-screen flex flex-col">
//             <div className="p-4 border-b flex justify-between items-center">
//                 <h1 className="text-xl font-bold">Чат</h1>
//                 <Button onClick={() => navigate("/profile")}>Вернуться в профиль</Button>
//             </div>
//             <div className="flex-1">
//                 <ChatComponent />
//             </div>
//         </div>
//     )
// };

export default ChatPage;