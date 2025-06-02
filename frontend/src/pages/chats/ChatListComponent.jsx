import React, { useState, useEffect } from 'react';
import { List, Spin, Button, Modal, Input, message, Popconfirm, Avatar } from 'antd';
import API from '../../services/API.js';
import AuthStore from "store/AuthStore";
import ProfileService from "../../services/profile.service.js";
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
// import PlusOutlined from '@ant-design/icons/lib/icons';
// import DeleteOutlined from '@ant-design/icons/lib/icons';
import ChatService from '../../services/chat.service';
import { useNavigate } from 'react-router-dom';
import { findOrCreateDirectChat } from '../../utils/chatUtils.js';

const ChatListComponent = ({ onChatSelect, selectedChatId }) => {
    const { currentId } = AuthStore;
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newChatUsers, setNewChatUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [newChatName, setNewChatName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (currentId) {
            fetchChats();
            fetchAllUsers();
        }
    }, [currentId]);

    const fetchChats = async () => {
        if (!currentId) return;
        setLoading(true);
        try {
            const response = await ChatService.getChatsWithProfiles(currentId);
            setChats(response.data || []);
        } catch (error) {
            console.error('Ошибка загрузки чатов с профилями:', error);
            message.error('Ошибка загрузки чатов');
        } finally {
            setLoading(false);
        }
    };

    const getChatName = (chat) => {
        if (chat.participants_profiles && chat.participants_profiles.length === 2) {
            const otherUser = chat.participants_profiles.find(profile => profile.user_id !== currentId);
            return otherUser ? otherUser.name || otherUser.username || 'Неизвестный пользователь' : 'Личный чат';
        }
        return chat.name || `Чат ${chat.id}`;
    };

    // const handleUserSelectForNewChat = async (otherUserId) => {
    //     console.log('handleUserSelectForNewChat вызван с ID:', otherUserId);
    //     if (newChatUsers.length > 1) {
    //         // Логика создания группового чата
    //     } else if (newChatUsers.length === 1) {
    //         const otherUserIdForDirectChat = newChatUsers[0];
    //         await findOrCreateDirectChat(otherUserIdForDirectChat, currentId, chats, ChatService.createChat, navigate, message);
    //         setIsModalVisible(false);
    //     }
    // };

    const handleUserSelectForNewChat = (otherUserId) => {
        console.log('Выбран пользователь с ID:', otherUserId);
        setNewChatUsers(prev => {
            if (prev.includes(otherUserId)) {
                return prev.filter(id => id !== otherUserId); // Удалить, если уже выбран
            } else {
                return [...prev, otherUserId]; // Добавить, если не выбран
            }
        });
    };

    const fetchAllUsers = async () => {
        try {
            const response = await ProfileService.getProfiles();
            setAllUsers(response.data.profiles || []);
        } catch (error) {
            console.error('Ошибка загрузки профилей:', error);
            message.error('Не удалось загрузить профили пользователей');
        }
    };
    

    const showCreateChatModal = () => {
        setIsModalVisible(true);
        setNewChatUsers([]);
        setNewChatName('');
    };

    const createChat = async () => {
        if (newChatUsers.length === 0) {
            message.warning('Выберите хотя бы одного участника');
            return;
        }

        // Проверяем, является ли это попыткой создать личный чат с уже существующим
        if (newChatUsers.length === 1) {
            const selectedUserId = newChatUsers[0];
            const existingChat = chats.find(chat =>
                chat.participants_profiles &&
                chat.participants_profiles.length === 2 &&
                chat.participants_profiles.some(profile => profile.user_id === selectedUserId) &&
                chat.participants_profiles.some(profile => profile.user_id === currentId)
            );

            if (existingChat) {
                setIsModalVisible(false);
                onChatSelect(existingChat.id);
                navigate(`/chats/${existingChat.id}`);
                message.info('Личный чат с этим пользователем уже существует.', 3);
                return; // Прерываем создание нового чата
            }
        }
        
        setLoading(true);
        try {
            const nameToSend = newChatUsers.length === 1 ? "" : newChatName || `Чат с ${newChatUsers.length + 1} участниками`;
            await API.post('/chats', {
                name: nameToSend,
                user_ids: [...newChatUsers, currentId]
            });
            message.success('Чат создан!');
            setIsModalVisible(false);
            await fetchChats();
            onChatSelect(response.data.id);
            navigate(`/chat/${response.data.id}`);
        } catch (error) {
            message.error('Ошибка создания чата');
            console.error('Ошибка создания чата:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteChat = async (chatId) => {
        setLoading(true);
        try {
            await ChatService.deleteChat(chatId);
            message.success('Чат удален!');
            await fetchChats();
            if (selectedChatId === chatId) {
                onChatSelect(null);
                navigate('/chats');
            }
        } catch (error) {
            console.error('Ошибка удаления чата:', error);
            message.error('Не удалось удалить чат');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ borderRight: '1px', paddingRight: 16 }}>
            <div className="mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showCreateChatModal}
                    size="small"
                />
            </div>
            <Spin spinning={loading}>
                <List
                    dataSource={chats}
                    renderItem={chat => (
                        <List.Item
                            key={chat.id}
                            actions={[
                                <Popconfirm
                                    title="Вы уверены, что хотите удалить этот чат?"
                                    onConfirm={() => deleteChat(chat.id)}
                                    okText="Да"
                                    cancelText="Нет"
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                    />
                                </Popconfirm>,
                            ]}
                            onClick={() => {
                                console.log('ChatListComponent - Chat clicked - id:', chat.id);
                                onChatSelect(chat.id);
                            }}
                            style={{
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: selectedChatId === chat.id ? '#bae7ff' : 'white',
                                fontWeight: selectedChatId === chat.id ? 'bold' : 'normal',
                                borderRadius: '6px',
                                marginBottom: '4px',
                            }}
                        >
                            {getChatName(chat)}
                        </List.Item>
                    )}
                />
            </Spin>

            <Modal
                title="Создать новый чат"
                visible={isModalVisible}
                onOk={createChat}
                onCancel={() => setIsModalVisible(false)}
                okText="Создать"
                cancelText="Отмена"
                confirmLoading={loading}
            >
                {newChatUsers.length > 1 && (
                    <Input
                    placeholder="Название чата (необязательно)"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                )}
                <div style={{ marginBottom: 8 }}>Выберите участников:</div>
                <List
                    dataSource={allUsers.filter(u => u.user_id !== currentId)}
                    renderItem={profile => (
                        <List.Item
                            // onClick={() => {
                            //     setNewChatUsers(prev =>
                            //         prev.includes(profile.user_id)
                            //             ? prev.filter(id => id !== profile.user_id)
                            //             : [...prev, profile.user_id]
                            //     );
                            // }}
                            onClick={() => handleUserSelectForNewChat(profile.user_id)}
                            style={{
                                cursor: 'pointer',
                                background: newChatUsers.includes(profile.user_id) ? '#e6f7ff' : 'white',
                                padding: '8px 12px',
                                borderRadius: 4
                            }}
                        >
                            <div>
                                <div>{profile.name || 'Без имени'}</div>
                                {profile.username && <div style={{ fontSize: 12, color: '#666' }}>{profile.username}</div>}
                            </div>
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default ChatListComponent;