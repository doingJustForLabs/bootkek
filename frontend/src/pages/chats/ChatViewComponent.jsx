import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, message, Spin, Modal, Avatar } from 'antd';
import API from 'services/api.js';
import AuthStore from "store/AuthStore";
import ChatService from '../../services/chat.service';
import { Link } from 'react-router-dom';

const ChatViewComponent = ({ chatId }) => {
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
        
        try {
            const tempMessage = {
                tempId: Date.now(),
                content: inputValue,
                user_id: currentId,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };

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
        <div className="h-full flex flex-col">
            <div className="p-2 border-b flex justify-between items-center">
                <h2 className="font-semibold" style={{ color: 'white' }}>
                    {chatDetails?.name || (chatDetails?.participants_profiles?.length === 2
                        ? chatDetails.participants_profiles.find(p => p.user_id !== currentId)?.name || chatDetails.participants_profiles.find(p => p.user_id !== currentId)?.username || 'Личный чат'
                        : 'Групповой чат') || 'Чат'}
                </h2>
                <Button onClick={toggleChatInfo} size="small">
                    Информация
                </Button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spin tip="Загрузка сообщений..." />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    <List
                        dataSource={messages}
                        renderItem={msg => (
                            <List.Item
                                key={msg.id || msg.tempId}
                                className={`message ${msg.user_id === currentId ? 'sent' : 'received'}`}
                                style={{ justifyContent: msg.user_id === currentId ? 'flex-end' : 'flex-start' }}
                            >
                                <div
                                    className={`message-bubble ${msg.status || ''}`}
                                    style={{
                                        maxWidth: '70%',
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        background: msg.user_id === currentId ? '#1890ff' : '#f0f0f0',
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
                padding: '10px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                gap: '8px'
            }}>
                <Input.TextArea
                    rows={2}
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
                    type="primary"
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    style={{ alignSelf: 'flex-end' }}
                >
                    Отправить
                </Button>
            </div>

            <Modal
                title={chatDetails?.name || 'Информация о чате'}
                visible={showChatInfo}
                onCancel={toggleChatInfo}
                footer={null}
            >
                {loadingChatDetails ? (
                    <Spin tip="Загрузка информации..." />
                ) : (
                    chatDetails && (
                        <div>
                            <h4>Участники:</h4>
                            <List
                                dataSource={chatDetails.participants_profiles}
                                renderItem={item => (
                                    <Link to={`/profile/${item.user_id}`} key={item.user_id} style={{ display: 'block' }}>
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar>{item.name ? item.name[0].toUpperCase() : item.username ? item.username[0].toUpperCase() : '?'}</Avatar>}
                                                title={item.name || item.username || 'Неизвестный'}
                                                description={item.username && `@${item.username}`}
                                            />
                                        </List.Item>
                                    </Link>
                                )}
                            />
                            {/* Дополнительная информация о чате, если есть */}
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
};

export default ChatViewComponent;