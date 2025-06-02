import React, { useState, useEffect, useRef } from 'react';
import {Input, Button, List, message, Spin, Modal} from 'antd';
import API from 'services/api.js';
import AuthStore from "store/AuthStore.js";
import ChatService from 'services/chat.service.js';
import {SendOutlined} from '@ant-design/icons';
import DetailsButton from "components/ui/buttons/DetailsButton.jsx";
import ProfilesList from "components/profile/ProfilesList.jsx";
import ButtonDeleteChat from "components/ui/buttons/ButtonDeleteChat.jsx";

const ChatViewComponent = ({ chatId, actions = {} }) => {
    const { currentId } = AuthStore;
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [showChatInfo, setShowChatInfo] = useState(false);
    const [chatDetails, setChatDetails] = useState(null);
    const [loadingChatDetails, setLoadingChatDetails] = useState(false);

    useEffect(() => {
        if (chatId) {
            fetchMessages(chatId);
            connectWebSocket(chatId);
            fetchChatDetails(chatId, currentId);
            console.log('ChatId changed:', chatId)
        }
        else{
            setMessages([]);
            setInputValue('');
            setChatDetails(null);
            console.log('ChatId changed:', chatId)
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.close(1000, 'ChatId changed to null');
                socketRef.current = null;
            }
        }
        return () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.close(1000, 'Chat view unmounted');
                socketRef.current = null;
            }
        };
    }, [chatId]);

    const fetchMessages = async (id) => {
        const chatId = Number(id);
        setLoading(true);
        
        try {
            const response = await API.get(`/chats/${chatId}/messages`);
            setMessages(response.data || []);
        } catch (error) {
            console.error('Messages load error:', error);
            message.error('Ошибка загрузки сообщений');
        } finally {
            setLoading(false);
        }
    };

    const fetchChatDetails = async (chatId, userId) => {
        if (!chatId || !userId) return;
        setLoadingChatDetails(true);
        try {
            const response = await ChatService.getChatDetails(chatId, userId);
            setChatDetails(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Ошибка загрузки деталей чата:', error);
            message.error('Не удалось загрузить детали чата');
        } finally {
            setLoadingChatDetails(false);
        }
    };

    const toggleChatInfo = () => {
        setShowChatInfo(!showChatInfo);
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || !chatId) return;

        const tempMessage = {
            tempId: Date.now(),
            content: inputValue,
            user_id: currentId,
            timestamp: new Date().toISOString(),
            status: 'sending'
        };

        try {

            setMessages(prev => [...prev, tempMessage]);
            setInputValue('');

            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    type: 'message',
                    ...tempMessage,
                    sender_id: currentId
                }));
            } else {
                throw new Error('WebSocket not connected');
            }
        } catch (error) {
            console.log(error);
            setMessages(prev => prev.map(msg =>
                msg.tempId === tempMessage.tempId
                    ? { ...msg, status: 'failed' }
                    : msg
            ));
        }
    };

    const connectWebSocket = async (id) => {
        const chatId = Number(id);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            const socket = new WebSocket('ws://localhost:8000/ws/chat');

            socket.onopen = () => {
                console.log('WebSocket connected');
                socket.send(JSON.stringify({
                    token: token,
                    chatId: chatId
                }));
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // console.log('Received WS data:', data);

                // Обработка ошибки авторизации
                if (data.type === 'auth_error') {
                    console.error('WebSocket auth error:', data.message);
                    // handleAuthError(); // Перенесите handleAuthError в ChatViewComponent, если необходимо
                    return;
                }

                if (data.type === 'connection_ack') {
                    console.log('Successfully authenticated');
                    return;
                }

                if (data.type === 'message_temp_ack') {
                    setMessages(prev => prev.map(msg =>
                        msg.tempId === data.tempId
                            ? { ...msg, status: 'sending', user_id: data.user_id }
                            : msg
                    ));
                    return;
                }

                if (data.type === 'message_confirmation') {
                    setMessages(prev => prev.map(msg =>
                        msg.tempId === data.tempId
                            ? {
                                ...msg,
                                id: data.messageId,
                                status: 'delivered',
                                user_id: data.user_id
                            }
                            : msg
                    ));
                    return;
                }

                if (data.type === 'chat_message') {
                    setMessages(prev => {
                        const filtered = data.data.tempId
                            ? prev.filter(msg => msg.tempId !== data.data.tempId)
                            : prev;

                        const existingIndex = filtered.findIndex(m => m.id === data.data.id);

                        if (existingIndex >= 0) {
                            const updated = [...filtered];
                            updated[existingIndex] = data.data;
                            return updated;
                        }

                        return [...filtered, {
                            ...data.data,
                            user_id: data.data.user_id
                        }];
                    });
                }
            };
            socket.onerror = (error) => console.error('WebSocket error:', error);
            socket.onclose = (event) => console.log('WebSocket disconnected', event.code, event.reason);
            socketRef.current = socket;
        } catch (error) {
            console.error('WebSocket connection error:', error);
            message.error('Ошибка подключения к чату');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex items-center" style={{backgroundColor: '#596acc', padding: "5px 35px"}}>
                <h2 className="font-semibold" style={{ fontSize: "20px", color: "white" }}>
                    {chatDetails?.name || (chatDetails?.participants_profiles?.length === 2
                        ? chatDetails.participants_profiles.find(p => p.user_id !== currentId)?.name || chatDetails.participants_profiles.find(p => p.user_id !== currentId)?.username || 'Личный чат'
                        : 'Групповой чат') || 'Чат'}
                </h2>
                <div style={{marginLeft: "auto", gap: "10px"}}>
                    <DetailsButton onClick={toggleChatInfo} style={{color: "white", fontSize: "20px"}}/>
                    <ButtonDeleteChat targetChatId={chatId} onRefresh={actions.fetchChats} setLoading={setLoading} style={{color: "white", fontSize: "20px"}}/>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spin tip="Загрузка сообщений..." />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto" style={{padding: "0 50px"}}>
                    <List
                        dataSource={messages}
                        renderItem={msg => (
                            <List.Item
                                key={msg.id || msg.tempId}
                                className={`message ${msg.user_id === currentId ? 'sent' : 'received'}`}
                                style={{ justifyContent: msg.user_id === currentId ? 'flex-end' : 'flex-start', border: 0 }}
                            >
                                <div
                                    className={`message-bubble ${msg.status || ''}`}
                                    style={{
                                        maxWidth: '70%',
                                        padding: '8px 12px',
                                        borderRadius: msg.user_id === currentId ? '12px 24px 0 24px' : '24px 12px 24px 0',
                                        background: msg.user_id === currentId ? '#4363fa' : '#f3f5ff',
                                        color: msg.user_id === currentId ? '#fff' : '#000',
                                        marginLeft: msg.user_id === currentId ? 'auto' : '0',
                                        opacity: msg.isPending ? 0.7 : 1,
                                        transition: 'opacity 0.3s ease'
                                    }}
                                >
                                    <p style={{ margin: 0 }}>{msg.content}</p>
                                    <small style={{
                                        display: 'block',
                                        textAlign: 'right',
                                        opacity: 0.7,
                                        fontSize: '0.8em',
                                        marginTop: '4px'
                                    }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {/* Индикаторы статуса */}
                                        {msg.status === 'sending' && ' (отправка...)'}
                                        {msg.status === 'failed' && ' (не отправлено)'}
                                        {msg.status === 'delivered' && ' ✓'}
                                        {/* Для обратной совместимости с isPending */}
                                        {!msg.status && msg.isPending && ' (отправка...)'}
                                        {!msg.status && !msg.isPending && msg.tempId && ' ✓'}
                                    </small>
                                </div>
                            </List.Item>
                        )}
                        />
                        <div ref={messagesEndRef} />
                </div>
            )}

            <div className="message-input" style={{
                backgroundColor: '#f4f4f4',
                padding: '10px',
                height: '10vh',
                borderTop: '1px solid #f0f0f0',
                alignContent: "center",
                display: 'flex',
                gap: '8px'
            }}>
                <Input.TextArea
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder="Введите сообщение..."
                    style={{ flex: 1 }}
                />
                <Button
                    shape="circle"
                    type="primary"
                    size="large"
                    icon={<SendOutlined/>}
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                />
            </div>

            <Modal
                title={chatDetails?.name || 'Участники чата'}
                visible={showChatInfo}
                onCancel={toggleChatInfo}
                footer={null}
            >
                {loadingChatDetails ? (
                    <Spin tip="Загрузка информации..." />
                ) : (
                    chatDetails && (
                        <div>
                            <ProfilesList profilesData={chatDetails.participants_profiles}/>
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
};

export default ChatViewComponent;