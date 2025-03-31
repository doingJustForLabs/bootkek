import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button, List, message } from 'antd';

const ChatComponent = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        socketRef.current = new WebSocket('ws://127.0.0.1:8000/ws/chat');

        socketRef.current.onopen = () => {
            console.log('WebSocket connected');
            // Авторизация через куки (HttpOnly)
        };

        socketRef.current.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages(prev => [...prev, newMessage]);
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [user]);

    const sendMessage = () => {
        if (!inputValue.trim() || !socketRef.current) return;

        const message = {
            content: inputValue,
            sender_id: user.id,
            timestamp: new Date().toISOString()
        };

        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
            setInputValue('');
        } else {
            message.error('Соединение с чатом не установлено');
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-container">
                <List
                    dataSource={messages}
                    renderItem={msg => (
                        <List.Item>
                            <div className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                                <div className="message-content">
                                    <p>{msg.content}</p>
                                    <small>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </small>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
            
            <div className="message-input">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={sendMessage}
                    placeholder="Введите сообщение..."
                />
                <Button type="primary" onClick={sendMessage}>
                    Отправить
                </Button>
            </div>
        </div>
    );
};

export default ChatComponent;