import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, message, Spin, Modal, Avatar } from 'antd';
import { DownloadOutlined, LoadingOutlined, PaperClipOutlined, CloseOutlined } from '@ant-design/icons';
import API from '../../services/API.js';
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
    const [fileToUpload, setFileToUpload] = useState(null);
    const fileInputRef = useRef(null);
    const [isSendingFile, setIsSendingFile] = useState(false);

    // Ограничения должны соответствовать бэкенду
    const FILE_LIMITS = {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB в байтах
        ALLOWED_TYPES: [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    };

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
        if (fileToUpload && fileToUpload.size > FILE_LIMITS.MAX_SIZE) {
        message.error(`Файл слишком большой для отправки`);
        return;
    }

        if ((!inputValue.trim() && !fileToUpload) || !chatId) return;
        
        try {
            setIsSendingFile(!!fileToUpload);

            // 1. Создаем временное сообщение
            const tempMessage = {
                tempId: Date.now(),
                content: inputValue,
                user_id: currentId,
                timestamp: new Date().toISOString(),
                status: 'sending',
                file: fileToUpload ? {
                    name: fileToUpload.name,
                    size: fileToUpload.size,
                    type: fileToUpload.type,
                    url: URL.createObjectURL(fileToUpload) // Временный URL для превью
                } : null
            };

            // 2. Мгновенно добавляем в чат
            setMessages(prev => [...prev, tempMessage]);
            setInputValue('');
            
            // 3. Отправка в зависимости от типа
            if (fileToUpload) {
                // Отправка файла через HTTP
                const formData = new FormData();
                formData.append("file", fileToUpload);
                formData.append("sender_id", currentId);
                if (inputValue.trim()) {
                    formData.append("text", inputValue);
                }

                const response = await API.post(
                    `/chats/${chatId}/messages_with_file`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );

                // Обновляем статус сообщения
                setMessages(prev => prev.map(msg => 
                    msg.tempId === tempMessage.tempId 
                        ? { ...msg, status: 'delivered', id: response.data.id } 
                        : msg
                ));
                
                setFileToUpload(null);
            } else {
                // Отправка текста через WebSocket
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({
                        type: 'message',
                        ...tempMessage,
                        sender_id: currentId
                    }));
                } else {
                    throw new Error('WebSocket not connected');
                }
            }
        } catch (error) {
            console.error('Send error:', error);
            setMessages(prev => prev.map(msg =>
                msg.tempId === tempMessage.tempId
                    ? { ...msg, status: 'failed' }
                    : msg
            ));
            message.error(error.message || 'Ошибка отправки');
        } finally {
            // Всегда очищаем файл после отправки (успешной или нет)
            setFileToUpload(null);
            // Очищаем значение файлового инпута
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setIsSendingFile(false);
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
                            const existingFile = filtered[existingIndex].file;
                            const updated = [...filtered];
                            updated[existingIndex] = {
                                ...data.data,
                                file: existingFile || data.data.file, // Сохраняем файл если был
                                user_id: data.data.user_id
                            };
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

    useEffect(() => {
        console.log('Messages:', messages); // Проверьте структуру данных
    }, [messages]);

    const handleDownload = async (fileData) => {
        try {
            if (!fileData?.url || !fileData?.name) {
            throw new Error('Недостаточно данных для загрузки файла');
            }

            // Извлекаем имя файла из URL (последняя часть после /)
            const fileUuid = fileData.url.split('/').pop();
            
            message.loading('Начинаем загрузку...', 0);

            // Вариант 1: Прямая загрузка по URL (если файлы доступны без авторизации)
            const link = document.createElement('a');
            link.href = fileData.url;
            link.setAttribute('download', fileData.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Вариант 2: Через API с авторизацией (если нужен токен)
            /*
            const response = await API.get(`/download/${fileUuid}`, {
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileData.name);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            }, 100);
            */

            message.destroy();
            message.success('Файл загружается...');
            
        } catch (error) {
            console.error('Download error:', error);
            message.destroy();
            message.error(error.message || 'Ошибка при загрузке файла');
        }
    };

    // Вне компонента
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Расширение файла
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'];

        // Проверка расширения файла (дополнительно к MIME-типу)
        if (!allowedExtensions.includes(fileExtension)) {
            message.error(`Неподдерживаемый формат файла: .${fileExtension}`);
            e.target.value = '';
            return;
        }

        // Проверка MIME-типа
        if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
            message.error(`Неподдерживаемый тип файла: ${file.type}`);
            e.target.value = '';
            return;
        }

        // Проверка размера файла
        if (file.size > FILE_LIMITS.MAX_SIZE) {
            message.error(`Файл слишком большой (${formatFileSize(file.size)}). Максимальный размер: ${formatFileSize(FILE_LIMITS.MAX_SIZE)}`);
            e.target.value = '';
            return;
        }

        setFileToUpload(file);
        message.success(`Файл "${file.name}" готов к отправке (${formatFileSize(file.size)})`);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

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

                                    {msg.file && (
                                        <div style={{ marginTop: 8 }}>
                                            <Button
                                            type="text"
                                            icon={<DownloadOutlined />}
                                            onClick={() => handleDownload(msg.file)}
                                            style={{ 
                                                padding: 0,
                                                color: msg.user_id === currentId ? '#fff' : '#1890ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4
                                            }}
                                            >
                                            <span style={{
                                                textDecoration: 'underline',
                                                textUnderlineOffset: 3
                                            }}>
                                                {msg.file.name}
                                            </span>
                                            <span style={{ opacity: 0.7, fontSize: '0.8em' }}>
                                                ({formatFileSize(msg.file.size)})
                                            </span>
                                            </Button>
                                        </div>
                                    )}

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

            {fileToUpload && !isSendingFile && (
                <div style={{
                    padding: '8px 12px',
                    background: '#4a5aa1',
                    borderRadius: 4,
                    margin: '0 10px 8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#fff'
                }}>
                    <PaperClipOutlined />
                    <span style={{ marginLeft: 8, flex: 1 }}>
                        {fileToUpload.name} ({formatFileSize(fileToUpload.size)})
                    </span>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => {
                            setFileToUpload(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }}
                        size="small"
                        style={{ color: '#fff' }}
                    />
            </div>
            )}

            <div className="message-input" style={{
                padding: '10px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                gap: '8px',
            }}>
                {/* Скрытый input для файлов */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                
                {/* Кнопка прикрепления файла */}
                <Button
                    type="text"
                    icon={<PaperClipOutlined />}
                    onClick={triggerFileInput}
                    style={{
                    fontSize: '20px',
                    color: '#1890ff',
                    marginBottom: '4px'
                    }}
                />

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
                    disabled={!inputValue.trim() && !fileToUpload}
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