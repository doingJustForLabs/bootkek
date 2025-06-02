import React, { useState, useEffect } from 'react';
import {List, Spin, Button, FloatButton, Modal, Input, message, Tooltip} from 'antd';
import API from 'services/api.js';
import AuthStore from "store/AuthStore.js";
import ProfileService from "services/profile.service.js";
import { FormOutlined } from '@ant-design/icons';

const ChatsList = ({ onChatSelect, selectedChatId }) => {
    const { currentId } = AuthStore;
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newChatUsers, setNewChatUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [newChatName, setNewChatName] = useState('');

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
            const response = await API.get(`/chats/${currentId}`);
            setChats(response.data || []);
        } catch (error) {
            console.error('Chats load error:', error);
            message.error('Ошибка загрузки чатов');
        } finally {
            setLoading(false);
        }
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
        setLoading(true);
        try {
            await API.post('/chats', {
                name: newChatName || `Чат с ${newChatUsers.length} участниками`,
                user_ids: [...newChatUsers, currentId]
            });
            message.success('Чат создан!');
            setIsModalVisible(false);
            await fetchChats();
        } catch (error) {
            message.error('Ошибка создания чата');
            console.error('Ошибка создания чата:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!chats || !Array.isArray(chats) || chats.length === 0) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
                height: "100%",
                textAlign: "center"
            }}>
                <span style={{ color: "#888", fontSize: "20px" }}>Нет доступных чатов...</span>
                <Button type="link" style={{ color: "#5695ee", fontSize: "20px", textDecoration: "underline" }} onClick={showCreateChatModal}>Создайте новый!</Button>

                <Modal
                    title="Создать новый чат"
                    visible={isModalVisible}
                    onOk={createChat}
                    onCancel={() => setIsModalVisible(false)}
                    okText="Создать"
                    cancelText="Отмена"
                    confirmLoading={loading}
                >
                    <Input
                        placeholder="Ведите название чата"
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                    />
                    <div style={{ marginBottom: 8 }}>Выберите участников:</div>
                    <List
                        dataSource={allUsers.filter(u => u.user_id !== currentId)}
                        renderItem={profile => (
                            <List.Item
                                onClick={() => {
                                    setNewChatUsers(prev =>
                                        prev.includes(profile.user_id)
                                            ? prev.filter(id => id !== profile.user_id)
                                            : [...prev, profile.user_id]
                                    );
                                }}
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
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                gap: "5px"
            }}>
                <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>Чаты</h2>
                <Tooltip title={"Создать чат"}>
                    <Button
                        type="primary"
                        style={{
                            marginLeft: "auto",
                            borderRadius: "50%"
                        }}
                        icon={<FormOutlined />}
                        onClick={showCreateChatModal}
                    />
                </Tooltip>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                <Spin spinning={loading}>
                    <List
                        dataSource={chats}
                        renderItem={chat => (
                            <List.Item
                                key={chat.id}
                                onClick={() => {
                                    console.log('ChatsList - Chat clicked - id:', chat.id);
                                    onChatSelect(chat.id);
                                }}
                                style={{
                                    cursor: 'pointer',
                                    padding: '8px 12px',
                                    backgroundColor: selectedChatId === chat.id ? '#bae7ff' : 'white',
                                    fontWeight: selectedChatId === chat.id ? 'bold' : 'normal',
                                    fontSize: "18px",
                                    borderRadius: '6px',
                                    marginBottom: '4px',
                                }}
                            >
                                {chat.name || `Чат ${chat.id}`}
                            </List.Item>
                        )}
                    />
                </Spin>
            </div>

            <Modal
                title="Создать новый чат"
                visible={isModalVisible}
                onOk={createChat}
                onCancel={() => setIsModalVisible(false)}
                okText="Создать"
                cancelText="Отмена"
                confirmLoading={loading}
            >
                <Input
                    placeholder="Ведите название чата"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <div style={{ marginBottom: 8 }}>Выберите участников:</div>
                <List
                    dataSource={allUsers.filter(u => u.user_id !== currentId)}
                    renderItem={profile => (
                        <List.Item
                            onClick={() => {
                                setNewChatUsers(prev =>
                                    prev.includes(profile.user_id)
                                        ? prev.filter(id => id !== profile.user_id)
                                        : [...prev, profile.user_id]
                                );
                            }}
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

export default ChatsList;