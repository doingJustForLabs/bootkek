import React, { useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import NavLayout from "../../components/layouts/NavLayout";
import ChatListComponent from "./ChatListComponent";
import ChatViewComponent from "./ChatViewComponent";


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
            <div className="h-screen flex">
                <div className="w-80 border-r p-4">
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold " style={{ color: 'white' }}>Чаты</h2>
                    </div>
                    <ChatListComponent
                        onChatSelect={handleChatSelect}
                        selectedChatId={selectedChatId}
                    />
                </div>
                <div className="flex-1 p-4"> {/* Правая колонка для отображения выбранного чата */}
                    {selectedChatId ? (
                        <ChatViewComponent key={selectedChatId} chatId={selectedChatId} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Выберите чат из списка
                        </div>
                    )}
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