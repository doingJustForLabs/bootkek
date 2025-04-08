import {useState, useEffect, useRef, useCallback} from 'react';
import { useAuth } from '../pages/AuthContext';
import { Input, Button, List, message, Modal, Spin } from 'antd';
import API from '../services/API';
import { Navigate } from 'react-router-dom';

const ChatComponent = () => {
    const { user, loading: authLoading, checkAuth } = useAuth();
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newChatUsers, setNewChatUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Гарантированное получение user.id
    const getUserId = useCallback(() => {
        if (!user?.id) {
            console.error("User ID is missing!", user);
            // Попытка перепроверить аутентификацию
            checkAuth().then(() => {
                if (!user?.id) {
                    throw new Error("User not authenticated");
                }
            });
        }
        return user.id;
    }, [user, checkAuth]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            message.error("Требуется авторизация");
            return;
        }

        // Теперь getUserId() всегда вернет корректный ID
        console.log("Current user ID:", getUserId());

        // ... остальная логика компонента
    }, [user, authLoading, getUserId]);

    // Загрузка чатов пользователя
    const fetchChats = async () => {
        if (!user?.id) {  // Добавляем проверку
            console.error('User ID is undefined');
            return;
        }

        setLoading(true);
        try {
            const response = await API.get(`/chats/${user.id}`);
            console.log('Chats data:', response.data); // Логируем данные

            // Проверяем и преобразуем данные при необходимости
            const chatsData = Array.isArray(response.data)
                ? response.data
                : [];

            setChats(chatsData);
        } catch (error) {
            console.error('Chats load error:', error.response?.data || error);
            message.error('Ошибка загрузки чатов');
        } finally {
            setLoading(false);
        }
    };

    // Загрузка сообщений чата
    const fetchMessages = async (chatId) => {
        if (!chatId) return;

        try {
            const response = await API.get(`/chats/${chatId}/messages`);
            setMessages(response.data || []);
        } catch (error) {
            console.error('Messages load error:', error);
            message.error('Ошибка загрузки сообщений');
        }
    };

    // Отправка сообщения
    const sendMessage = async () => {
        if (!inputValue.trim() || !selectedChat) return;

        try{
            const userId = getUserId();

            // Создаем временное сообщение
            const tempMessage = {
                tempId: Date.now(), // Временный ID
                content: inputValue,
                user_id: userId,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };

            // Сразу добавляем в UI
            setMessages(prev => [...prev, tempMessage]);
            setInputValue('');

            // Отправляем через WebSocket
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    type: 'message',
                    ...tempMessage,
                    sender_id: userId
                }));
            } else {
                throw new Error('WebSocket not connected');
            }
        } catch (error) {
            // Если ошибка, обновляем статус
            setMessages(prev => prev.map(msg =>
                msg.tempId === tempMessage.tempId
                    ? {...msg, status: 'failed'}
                    : msg
            ));
        }
    };

    useEffect(() => {
        const fetchChats = async () => {
            try {
                if (!user?.id) {  // Добавляем проверку
                    console.error('User ID is undefined');
                    return;
                }
                const response = await API.get(`/chats/${user.id}`);
                console.log('Ответ от сервера:', response.data); // Проверьте данные в консоли
            } catch (error) {
                console.error('Ошибка загрузки чатов:', error);
            }
        };
        fetchChats();
    }, []);

    // Создание нового чата
    // const createChat = async () => {
    //     try {
    //         await API.post('/chats', {
    //             name: `Чат с ${newChatUsers.length} участниками`,
    //             user_ids: [...newChatUsers, user.id] // Добавляем текущего пользователя
    //         });
    //         message.success('Чат создан!');
    //         setIsModalVisible(false);
    //         fetchChats();
    //     } catch (error) {
    //         message.error('Ошибка создания чата');
    //         console.error('Ошибка создания чата:', error);
    //     }
    // };

    useEffect(() => {
        if (user?.id) { // Добавлена проверка на user.id
            fetchChats();
        }
    }, [user?.id]); // Зависимость от user.id вместо user


    useEffect(() => {
        if (!selectedChat) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            return;
        }

        const socket = new WebSocket('ws://localhost:8000/ws/chat');

        socket.onopen = () => {
            console.log('WebSocket connected');
            socket.send(JSON.stringify({
                token: token,
                chatId: selectedChat
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received WS data:', data);

            // Обрабатываем подтверждение подключения
            if (data.type === 'connection_ack') {
                console.log('Successfully authenticated');
                return;
            }

            // Обработка временных сообщений
            if (data.type === 'message_temp_ack') {
                setMessages(prev => prev.map(msg =>
                    msg.tempId === data.tempId
                        ? { ...msg, status: 'sending', user_id: data.user_id } // Фиксим user_id
                        : msg
                ));
                return;
            }

            // Обработка подтверждения доставки
            if (data.type === 'message_confirmation') {
                setMessages(prev => prev.map(msg =>
                    msg.tempId === data.tempId
                        ? {
                            ...msg,
                            id: data.messageId,
                            status: 'delivered',
                            user_id: data.user_id}
                        : msg
                ));
                return;
            }

            // Обрабатываем сообщения
            if (data.type === 'chat_message') {
                setMessages(prev => {
                    // Удаляем временное сообщение если есть
                    const filtered = data.data.tempId
                        ? prev.filter(msg => msg.tempId !== data.data.tempId)
                        : prev;

                    // Добавляем/обновляем сообщение
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

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = (event) => {
            console.log('WebSocket disconnected', event.code, event.reason);
        };

        socketRef.current = socket;

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close(1000, 'Component unmounted');
            }
        };
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (authLoading) {
        return <Spin tip="Проверка авторизации..." />;
    }

    if (!user) {
        alert("Пожалуйста, войдите в систему");
        return <Navigate to="/" replace />;
    }

    console.log('Current user in ChatComponent:', {
        user,
        hasId: !!user?.id,
        loading: authLoading
    });

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <Spin spinning={loading}>
                    <List
                        dataSource={chats}
                        renderItem={chat => (
                            <List.Item
                                key={chat.id}
                                onClick={() => {
                                    setSelectedChat(chat.id);
                                    fetchMessages(chat.id);
                                }}
                                style={{
                                    cursor: 'pointer',
                                    background: selectedChat === chat.id ? '#f0f0f0' : 'white',
                                    padding: '10px'
                                }}
                            >
                                {chat.name || `Чат ${chat.id}`}
                            </List.Item>
                        )}
                    />
                </Spin>
            </div>

            <div className="chat-messages">
                {selectedChat ? (
                    <>
                        <div className="messages-container" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                            <List
                                dataSource={messages}
                                renderItem={msg => (
                                    <List.Item
                                        key={msg.id || msg.tempId}
                                        style={{ padding: '8px 0' }}
                                        className={`message ${msg.user_id === user.id ? 'sent' : 'received'}`}
                                    >
                                        <div
                                            className={`message-bubble ${msg.status || ''}`}
                                            style={{
                                                maxWidth: '70%',
                                                padding: '8px 12px',
                                                borderRadius: '12px',
                                                background: msg.user_id === user.id ? '#1890ff' : '#f0f0f0',
                                                color: msg.user_id === user.id ? '#fff' : '#000',
                                                marginLeft: msg.user_id === user.id ? 'auto' : '0',
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
                    </>
                ) : (
                    <div style={{
                        padding: 20,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#888'
                    }}>
                        Выберите чат из списка
                    </div>
                )}
            </div>

            <Modal
                title="Создать новый чат"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
            >
                <List
                    dataSource={allUsers.filter(u => u.id !== user.id)}
                    renderItem={user => (
                        <List.Item
                            onClick={() => {
                                setNewChatUsers(prev =>
                                    prev.includes(user.id)
                                        ? prev.filter(id => id !== user.id)
                                        : [...prev, user.id]
                                );
                            }}
                            style={{
                                cursor: 'pointer',
                                background: newChatUsers.includes(user.id) ? '#e6f7ff' : 'white'
                            }}
                        >
                            {user.email}
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default ChatComponent;