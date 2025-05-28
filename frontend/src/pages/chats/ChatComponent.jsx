// import {useState, useEffect, useRef } from 'react';
// import { Input, Button, List, message, Modal, Spin } from 'antd';
// import API from '../../services/API.js';
// import { useNavigate, useParams } from 'react-router-dom';
// import AuthStore from "store/AuthStore";
// import ProfileService from "../../services/profile.service.js";
// import { PlusOutlined } from '@ant-design/icons';

// const ChatComponent = ({ chatId }) => {
    
//     const { currentId, isAuthenticated, loading: authLoading } = AuthStore;
//     const [chats, setChats] = useState([]);
//     const [messages, setMessages] = useState([]);
//     const [inputValue, setInputValue] = useState('');
//     // const [selectedChat, setSelectedChat] = useState(null);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [newChatUsers, setNewChatUsers] = useState([]);
//     const [allUsers, setAllUsers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const socketRef = useRef(null);
//     const messagesEndRef = useRef(null);
//     const [newChatName, setNewChatName] = useState('');

//     const navigate = useNavigate();
//     const currentChatIdFromUrl = useParams().chatId;

//     // Гарантированное получение user.id
//     const getUserId = () => {
//         if (!currentId) {
//             console.error("User ID is missing!");
//             throw new Error("User not authenticated");
//         }
//         return currentId;
//     };

//     useEffect(() => {
//         if (authLoading) return;

//         if (!currentId) {
//             message.error("Требуется авторизация");
//             return;
//         }

//         // Теперь getUserId() всегда вернет корректный ID
//         console.log("Current user ID:", currentId);
//         if (currentId) {
//             fetchChats();
//         }
//     }, [currentId, authLoading, isAuthenticated]);

//     const fetchAllUsers = async () => {
//         try {
//             const response = await ProfileService.getProfiles(); // Используйте ProfileService
//             setAllUsers(response.data.profiles || []);
//         } catch (error) {
//             console.error('Ошибка загрузки профилей:', error);
//             message.error('Не удалось загрузить профили пользователей');
//         }
//     };

//     useEffect(() => {
//         if (currentId) {
//             fetchAllUsers();
//         }
//     }, [currentId]);

//     const showCreateChatModal = () => {
//         // fetchAllUsers();
//         setIsModalVisible(true);
//         setNewChatUsers([]);
//         setNewChatName('');
//     };
    
//     // Загрузка чатов пользователя
//     const fetchChats = async () => {
//         if (!currentId) {  // Добавляем проверку
//             console.error('User ID is undefined');
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await API.get(`/chats/${currentId}`);
//             console.log('Chats data:', response.data); // Логируем данные

//             // Проверяем и преобразуем данные при необходимости
//             const chatsData = Array.isArray(response.data)
//                 ? response.data
//                 : [];

//             setChats(chatsData);
//         } catch (error) {
//             console.error('Chats load error:', error.response?.data || error);
            
//             // Если ошибка 401 и refresh токен не помог - разлогиниваем
//             if (error.response?.status === 401) {
//                 message.error('Сессия истекла. Пожалуйста, войдите снова');
//                 localStorage.removeItem("accessToken");
//                 navigate("/login");
//             } else {
//                 message.error('Ошибка загрузки чатов');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (currentChatIdFromUrl) {
//             fetchMessages(currentChatIdFromUrl);
//         } else {
//             setMessages([]);
//         }
//     }, [currentChatIdFromUrl]);

//     // Загрузка сообщений чата
//     const fetchMessages = async (chatId) => {
//         if (!chatId) return;

//         setLoading(true);
//         try {
//             const response = await API.get(`/chats/${chatId}/messages`);
//             setMessages(response.data || []);
//         } catch (error) {
//             console.error('Messages load error:', error);
//             message.error('Ошибка загрузки сообщений');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Отправка сообщения
//     const sendMessage = async () => {
//         if (!inputValue.trim() || !selectedChat) return;

//         try{
//             const userId = getUserId();

//             // Создаем временное сообщение
//             const tempMessage = {
//                 tempId: Date.now(), // Временный ID
//                 content: inputValue,
//                 user_id: userId,
//                 timestamp: new Date().toISOString(),
//                 status: 'sending'
//             };

//             // Сразу добавляем в UI
//             setMessages(prev => [...prev, tempMessage]);
//             setInputValue('');

//             // Отправляем через WebSocket
//             if (socketRef.current?.readyState === WebSocket.OPEN) {
//                 socketRef.current.send(JSON.stringify({
//                     type: 'message',
//                     ...tempMessage,
//                     sender_id: userId
//                 }));
//             } else {
//                 throw new Error('WebSocket not connected');
//             }
//         } catch (error) {
//             // Если ошибка, обновляем статус
//             setMessages(prev => prev.map(msg =>
//                 msg.tempId === tempMessage.tempId
//                     ? {...msg, status: 'failed'}
//                     : msg
//             ));
//         }
//     };

//     // Создание нового чата
//     const createChat = async () => {
//         if (newChatUsers.length === 0) {
//             message.warning('Выберите хотя бы одного участника');
//             return;
//         }

//         try {
//             setLoading(true);
//             await API.post('/chats', {
//                 name: newChatName || `Чат с ${newChatUsers.length} участниками`,
//                 user_ids: [...newChatUsers, currentId] // Добавляем текущего пользователя
//             });
//             message.success('Чат создан!');
//             setIsModalVisible(false);
//             await fetchChats();
//         } catch (error) {
//             message.error('Ошибка создания чата');
//             console.error('Ошибка создания чата:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (currentChatIdFromUrl) {
//             connectWebSocket(currentChatIdFromUrl);
//         } else {
//             if (socketRef.current?.readyState === WebSocket.OPEN) {
//                 socketRef.current.close(1000, 'Navigated to /chats');
//                 socketRef.current = null;
//             }
//         }
//     }, [currentChatIdFromUrl, navigate]);

//     const connectWebSocket = async () => {
//         try {
//             const token = localStorage.getItem('accessToken');
//             if (!token) {
//                 throw new Error('No access token found');
//             }

//             const socket = new WebSocket('ws://localhost:8000/ws/chat');

//             socket.onopen = () => {
//                 console.log('WebSocket connected');
//                 socket.send(JSON.stringify({
//                     token: token,
//                     chatId: selectedChat
//                 }));
//             };

//             socket.onmessage = (event) => {
//                 const data = JSON.parse(event.data);
//                 console.log('Received WS data:', data);

//                 // Обработка ошибки авторизации
//                 if (data.type === 'auth_error') {
//                     console.error('WebSocket auth error:', data.message);
//                     handleAuthError();
//                     return;
//                 }

//                 // Остальная обработка сообщений (как у вас было)
//                 if (data.type === 'connection_ack') {
//                     console.log('Successfully authenticated');
//                     return;
//                 }

//                 if (data.type === 'message_temp_ack') {
//                     setMessages(prev => prev.map(msg =>
//                         msg.tempId === data.tempId
//                             ? { ...msg, status: 'sending', user_id: data.user_id }
//                             : msg
//                     ));
//                     return;
//                 }

//                 if (data.type === 'message_confirmation') {
//                     setMessages(prev => prev.map(msg =>
//                         msg.tempId === data.tempId
//                             ? {
//                                 ...msg,
//                                 id: data.messageId,
//                                 status: 'delivered',
//                                 user_id: data.user_id
//                             }
//                             : msg
//                     ));
//                     return;
//                 }

//                 if (data.type === 'chat_message') {
//                     setMessages(prev => {
//                         const filtered = data.data.tempId
//                             ? prev.filter(msg => msg.tempId !== data.data.tempId)
//                             : prev;

//                         const existingIndex = filtered.findIndex(m => m.id === data.data.id);

//                         if (existingIndex >= 0) {
//                             const updated = [...filtered];
//                             updated[existingIndex] = data.data;
//                             return updated;
//                         }

//                         return [...filtered, {
//                             ...data.data,
//                             user_id: data.data.user_id
//                         }];
//                     });
//                 }
//             };

//             socket.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//                 // Если ошибка связана с авторизацией
//                 if (error.message.includes('401')) {
//                     handleAuthError();
//                 }
//             };

//             socket.onclose = (event) => {
//                 console.log('WebSocket disconnected', event.code, event.reason);
//                 // Если отключение из-за авторизации
//                 if (event.code === 4001) { // Ваш код для auth errors
//                     handleAuthError();
//                 }
//             };

//             socketRef.current = socket;

//         } catch (error) {
//             console.error('WebSocket connection error:', error);
//             if (error.message.includes('auth') || error.message.includes('401')) {
//                 handleAuthError();
//             } else {
//                 message.error('Ошибка подключения к чату');
//             }
//         }
//     };
    
//     const handleAuthError = async () => {
//         try {
//             // Пытаемся обновить токен через API
//             await API.get('/auth/refresh');
//             connectWebSocket();
//         } catch (refreshError) {
//             console.error('Refresh token failed:', refreshError);
//             localStorage.removeItem('access_token');
//             navigate('/login');
//         }
//     };

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     if (authLoading) {
//         return <Spin tip="Проверка авторизации..." />;
//     }

//     // if (!isAuthenticated) {
//     //     alert("Пожалуйста, войдите в систему");
//     //     return <Navigate to="/" replace />;
//     // }

//     const handleChatClick = (chatId) => {
//         navigate(`/chats/${chatId}`);
//     };

//     console.log('Current user in ChatComponent:', {
//         currentId,
//         hasId: !!currentId,
//         loading: authLoading
//     });

//     return (
//         <div className="chat-container">
//             <div className="chat-sidebar">
//                 <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <h3 style={{ margin: 0 }}>Чаты</h3>
//                     <Button
//                         type="primary"
//                         icon={<PlusOutlined />}
//                         onClick={showCreateChatModal}
//                         size="small"
//                     />
//                 </div>
//                 <Spin spinning={loading}>
//                     <List
//                         dataSource={chats}
//                         renderItem={chat => (
//                             <List.Item
//                                 key={chat.id}
//                                 onClick={() => handleChatClick(chat.id)}
//                                 style={{
//                                     cursor: 'pointer',
//                                     background: currentChatIdFromUrl === chat.id ? '#f0f0f0' : 'white',
//                                     padding: '10px'
//                                 }}
//                             >
//                                 {chat.name || `Чат ${chat.id}`}
//                             </List.Item>
//                         )}
//                     />
//                 </Spin>
//             </div>

//             <div className="chat-messages">
//                 {currentChatIdFromUrl ? (
//                     loading ? ( // Показываем спиннер, пока идет загрузка сообщений
//                         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
//                             <Spin tip="Загрузка сообщений..." />
//                         </div>
//                     ) : (
//                         <>
//                             <div className="messages-container" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
//                                 <List
//                                     dataSource={messages}
//                                     renderItem={msg => (
//                                         <List.Item
//                                             key={msg.id || msg.tempId}
//                                             style={{ padding: '8px 0' }}
//                                             className={`message ${msg.user_id === currentId ? 'sent' : 'received'}`}
//                                         >
//                                             <div
//                                                 className={`message-bubble ${msg.status || ''}`}
//                                                 style={{
//                                                     maxWidth: '70%',
//                                                     padding: '8px 12px',
//                                                     borderRadius: '12px',
//                                                     background: msg.user_id === currentId ? '#1890ff' : '#f0f0f0',
//                                                     color: msg.user_id === currentId ? '#fff' : '#000',
//                                                     marginLeft: msg.user_id === currentId ? 'auto' : '0',
//                                                     opacity: msg.isPending ? 0.7 : 1,
//                                                     transition: 'opacity 0.3s ease'
//                                                 }}
//                                             >
//                                                 <p style={{ margin: 0 }}>{msg.content}</p>
//                                                 <small style={{
//                                                     display: 'block',
//                                                     textAlign: 'right',
//                                                     opacity: 0.7,
//                                                     fontSize: '0.8em',
//                                                     marginTop: '4px'
//                                                 }}>
//                                                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                                     {/* Индикаторы статуса */}
//                                                     {msg.status === 'sending' && ' (отправка...)'}
//                                                     {msg.status === 'failed' && ' (не отправлено)'}
//                                                     {msg.status === 'delivered' && ' ✓'}
//                                                     {/* Для обратной совместимости с isPending */}
//                                                     {!msg.status && msg.isPending && ' (отправка...)'}
//                                                     {!msg.status && !msg.isPending && msg.tempId && ' ✓'}
//                                                 </small>
//                                             </div>
//                                         </List.Item>
//                                     )}
//                                 />
//                                 <div ref={messagesEndRef} />
//                             </div>

//                             <div className="message-input" style={{
//                                 padding: '10px',
//                                 borderTop: '1px solid #f0f0f0',
//                                 display: 'flex',
//                                 gap: '8px'
//                             }}>
//                                 <Input.TextArea
//                                     rows={2}
//                                     value={inputValue}
//                                     onChange={(e) => setInputValue(e.target.value)}
//                                     onPressEnter={(e) => {
//                                         if (!e.shiftKey) {
//                                             e.preventDefault();
//                                             sendMessage();
//                                         }
//                                     }}
//                                     placeholder="Введите сообщение..."
//                                     style={{ flex: 1 }}
//                                 />
//                                 <Button
//                                     type="primary"
//                                     onClick={sendMessage}
//                                     disabled={!inputValue.trim()}
//                                     style={{ alignSelf: 'flex-end' }}
//                                 >
//                                     Отправить
//                                 </Button>
//                             </div>
//                         </>
//                     )
//                 ) : (
//                     <div style={{
//                         padding: 20,
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         height: '100%',
//                         color: '#888'
//                     }}>
//                         Выберите чат из списка
//                     </div>
//                 )}
//             </div>

//             <Modal
//                 title="Создать новый чат"
//                 visible={isModalVisible}
//                 onOk={createChat}
//                 onCancel={() => setIsModalVisible(false)}
//                 okText="Создать"
//                 cancelText="Отмена"
//                 confirmLoading={loading}
//             >
//                 <Input
//                     placeholder="Название чата (необязательно)"
//                     value={newChatName}
//                     onChange={(e) => setNewChatName(e.target.value)}
//                     style={{ marginBottom: 16 }}
//                 />
//                 <div style={{ marginBottom: 8 }}>Выберите участников:</div>
//                 <List
//                     dataSource={allUsers.filter(u => u.user_id  !== currentId)}
//                     renderItem={profile => (
//                         <List.Item
//                             onClick={() => {
//                                 setNewChatUsers(prev =>
//                                     prev.includes(profile.user_id)
//                                         ? prev.filter(id => id !== profile.user_id)
//                                         : [...prev, profile.user_id]
//                                 );
//                             }}
//                             style={{
//                                 cursor: 'pointer',
//                                 background: newChatUsers.includes(profile.id) ? '#e6f7ff' : 'white',
//                                 padding: '8px 12px',
//                                 borderRadius: 4
//                             }}
//                         >
//                             <div>
//                                 <div>{profile.name || 'Без имени'}</div>
//                                 {profile.username && <div style={{ fontSize: 12, color: '#666' }}>{profile.username}</div>}
//                             </div>
//                         </List.Item>
//                     )}
//                 />
//             </Modal>
//         </div>
//     );
// };

// export default ChatComponent;