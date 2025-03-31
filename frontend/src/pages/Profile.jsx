import React from 'react';

import { useState, useEffect } from 'react';

import { useAuth } from "./AuthContext.jsx";
import { API } from "../services/api.js";
import axios from 'axios';

import ChatComponent from '../components/ChatComponent.jsx';

const Profile = () => {
    // const { accessToken } = useAuth();
    // const [data, setData] = useState(null);

    // useEffect(() => {
    //     if (!accessToken) return;

    //     axios.get("http://127.0.0.1:8000/api/auth/me", {
    //         headers: {
    //             Authorization: `Bearer ${accessToken}`,
    //         },
    //     })
    //     .then((response) => {
    //         setData(response.data);
    //         console.log(response.data);
    //     })
    // }, [accessToken]);

    const { user } = useAuth(); // Используем обновлённый контекст
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url(/assets/muctr-bg.png)]">
            <div className="flex-col justify-self-start w-full max-w-sm p-8 rounded-4xl bg-white shadow-md">
                <img className="w-3/5 m-6" src="/assets/muctr-logo.png" alt="РХТУ-лого" />
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Ваш профиль</h1>
                {user && (
                    <div className="mb-4">
                        <p>Email: {user.email}</p>
                        {/* Другие данные пользователя */}
                    </div>
                )}
                <Button type="primary" onClick={() => setIsChatOpen(true)}>
                    Открыть чат
                </Button>
                <Modal title="Чат" open={isChatOpen} onCancel={() => setIsChatOpen(false)} footer={null} width={800}>
                    <ChatComponent />
                </Modal>
            </div>
        </div>
    );
};

export default Profile;