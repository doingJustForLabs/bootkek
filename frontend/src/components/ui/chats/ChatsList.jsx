import React, { useState, useEffect } from 'react';
import {List, Spin, Button, FloatButton, Modal, Input, message, Tooltip} from 'antd';
import API from 'services/api.js';
import AuthStore from "store/AuthStore.js";
import ProfileService from "services/profile.service.js";
import { FormOutlined } from '@ant-design/icons';
import ProfilePreview from "components/ui/profile/ProfilePreview.jsx";
import ProfilesList from "components/ui/profile/ProfilesList.jsx";
import Pagination from "components/ui/Pagination.jsx";
import ProfileStore from "store/ProfileStore.js";

const ChatsList = ({ onChatSelect, selectedChatId, chats}) => {
    const { currentId } = AuthStore;
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newChatUsers, setNewChatUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newChatName, setNewChatName] = useState('');

    useEffect(() => {
        if (currentId) {
            fetchProfiles(1);
        }
    }, [currentId]);

    const fetchProfiles = async (page) => {

        setCurrentPage(page);

        try {
            const response = await ProfileStore.getProfilesBySearch("", page, 4, {} );
            console.log(response.data);
            setProfiles(response.data.profiles);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error('Ошибка загрузки профилей:', error);
            message.error('Не удалось загрузить профили пользователей');
        }
    };

    const handlePageChange = (newPage) => {
        fetchProfiles(newPage);
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
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ marginBottom: 8 }}>Выберите участников:</div>
                    <ProfilesList profilesData={profiles}
                                  renderItem={
                                      (profile) => (
                                          <ProfilePreview
                                              profileData={profile}
                                              disabled={profile.user_id === currentId}
                                              style={{ background: newChatUsers.includes(profile.user_id) || (profile.user_id === currentId) ? '#e5e5ff' : '#f4f4f4',}}
                                              onClick={() => {
                                                  if (profile.user_id === currentId) return;
                                                  setNewChatUsers(prev => prev.includes(profile.user_id) ? prev.filter(id => id !== profile.user_id) : [...prev, profile.user_id]);}
                                              }
                                          />
                                      )
                                  }/>
                    {totalPages <= 1 ? null : (
                        <div style={{
                            justifySelf: "center"
                        }}>
                            <Pagination
                                style={{ justifyItems: "center", marginLeft: 'auto' }}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}/>
                        </div>)}

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
                                    padding: '14px',
                                    backgroundColor: selectedChatId === chat.id ? '#e5e5ff' : 'white',
                                    fontSize: "18px",
                                    borderRadius: selectedChatId === chat.id ? "50px 0 0 50px" : "50px",
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
                <ProfilesList profilesData={profiles}
                              renderItem={
                    (profile) => (
                        <ProfilePreview
                            profileData={profile}
                            disabled={profile.user_id === currentId}
                            style={{ background: newChatUsers.includes(profile.user_id) || (profile.user_id === currentId) ? '#e5e5ff' : '#f4f4f4',}}
                            onClick={() => {
                                if (profile.user_id === currentId) return;
                                setNewChatUsers(prev => prev.includes(profile.user_id) ? prev.filter(id => id !== profile.user_id) : [...prev, profile.user_id]);}
                            }
                        />
                    )
                }/>
                {totalPages <= 1 ? null : (
                    <div style={{
                        justifySelf: "center"
                    }}>
                        <Pagination
                            style={{ justifyItems: "center", marginLeft: 'auto' }}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}/>
                    </div>)}

            </Modal>
        </div>
    );
};

export default ChatsList;