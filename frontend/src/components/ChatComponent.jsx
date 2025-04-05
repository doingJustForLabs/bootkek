import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../pages/AuthContext';
import { Input, Button, List, message, Modal, Spin } from 'antd';
import API from '../services/API';

const ChatComponent = () => {
    const { user, loading: authLoading } = useAuth();
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

    if (authLoading) {
        return <Spin tip="Проверка авторизации..." />;
    }

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

    // Отправка сообщения
    const sendMessage = async () => {
        if (!inputValue.trim() || !selectedChat) return;

        // Создаем временное сообщение
        const tempMessage = {
            id: Date.now(), // Временный ID
            content: inputValue,
            user_id: user.id,
            timestamp: new Date().toISOString(),
            isPending: true
        };

        // Сразу добавляем в UI
        setMessages(prev => [...prev, tempMessage]);
        setInputValue('');

        try {
            // Параметры теперь передаются в URL, а не в теле запроса
            const response = await API.post(
                `/chats/${selectedChat}/messages?content=${encodeURIComponent(inputValue)}&user_id=${user.id}`,
                {}, // Пустое тело запроса
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setMessages(prev => prev.map(msg =>
                msg.id === tempMessage ? { ...response.data, isPending: false } : msg
            ));

            setInputValue('');
            console.log('Сообщение отправлено:', response.data);

        } catch (error) {
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            console.error('Ошибка отправки:', {
                status: error.response?.status,
                data: error.response?.data
            });
            message.error('Не удалось отправить сообщение');
        }
    };


    useEffect(() => {
        if (!selectedChat) return;

        socketRef.current = new WebSocket('ws://localhost:8000/ws/chat');

        socketRef.current.onopen = () => {
            console.log('WebSocket connected');
            // Авторизация через куки (HttpOnly)
        };

        socketRef.current.onmessage = (event) => {
            try {
                const serverMessage = JSON.parse(event.data);
                setMessages(prev => {
                    // Удаляем все временные сообщения с таким же содержанием
                    const filtered = prev.filter(msg =>
                        !(msg.isPending &&
                            msg.content === serverMessage.content &&
                            msg.user_id === serverMessage.user_id)
                    );

                    // Добавляем подтвержденное сообщение от сервера
                    return [...filtered, serverMessage];
                });
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (user?.id) { // Добавлена проверка на user.id
            fetchChats();
        }
    }, [user?.id]); // Зависимость от user.id вместо user

    if (!user) {
        return <div>Пожалуйста, войдите в систему</div>;
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
                                    <List.Item key={msg.id} style={{ padding: '8px 0' }}>
                                        <div
                                            className={`message ${msg.user_id === user.id ? 'sent' : 'received'}`}
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
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                                {msg.isPending && ' (отправка...)'}
                                                {String(msg.id).startsWith('temp-') && !msg.isPending && ' ✓'}
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
        // <div className="chat-container">
        //     <div className="messages-container">
        //         <List
        //             dataSource={messages}
        //             renderItem={msg => (
        //                 <List.Item>
        //                     <div className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
        //                         <div className="message-content">
        //                             <p>{msg.content}</p>
        //                             <small>
        //                                 {new Date(msg.timestamp).toLocaleTimeString()}
        //                             </small>
        //                         </div>
        //                     </div>
        //                 </List.Item>
        //             )}
        //         />
        //     </div>
        //
        //     <div className="message-input">
        //         <Input
        //             value={inputValue}
        //             onChange={(e) => setInputValue(e.target.value)}
        //             onPressEnter={sendMessage}
        //             placeholder="Введите сообщение..."
        //         />
        //         <Button type="primary" onClick={sendMessage}>
        //             Отправить
        //         </Button>
        //     </div>
        // </div>
    );
};

export default ChatComponent;