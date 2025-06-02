import React, { useRef, useEffect, useState, useCallback } from 'react';
import { UserOutlined, TeamOutlined, LeftCircleOutlined, NotificationOutlined, CommentOutlined, CarryOutOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import AuthStore from "store/AuthStore.js";
import {goTo} from "utils/navigator.js";
import {observer} from "mobx-react-lite";
import { useNavigate, useParams } from 'react-router-dom';
import { getAccessToken } from '../../utils/token';
import { NotificationContainer } from '../NotificationContainer.jsx'


const { Content, Sider } = Layout;

const NavLayout = observer(({ children }) => {
    const navigate = useNavigate();
    const { chatId: currentChatIdFromUrl } = useParams();
    const socketRef = useRef(null);
    const { currentId } = AuthStore;
    const accessToken = getAccessToken();
    const [showNotification, setShowNotification] = useState(() => {});
    const [isNavigatingToChat, setIsNavigatingToChat] = useState(null);

    const topMenuItems = [
        {
            key: "profile",
            icon: <UserOutlined style={{ fontSize: 20 }} />,
            label: "Профиль"
        },

        {
            key: "feed",
            icon: <NotificationOutlined style={{ fontSize: 20 }}/>,
            label: "Новости"
        },

        {
            key: "chats",
            icon: <CommentOutlined style={{ fontSize: 20 }}/>,
            label: "Чаты"
        },

        {
            key: "events",
            icon: <CarryOutOutlined style={{ fontSize: 20 }}/>,
            label: "Встречи"
        },

        {
            key: "users",
            icon: <TeamOutlined style={{ fontSize: 20 }}/>,
            label: "Люди"
        },
    ]

    const bottomMenuItems = [
        {
            key: "logout",
            icon: <LeftCircleOutlined style={{ fontSize: 20 }}/>,
            label: "Выйти",
            danger: true
        }
    ]

    const handleMenuClick = ({ key }) => {
        switch (key){
            case "profile":
                goTo(`/profile/${AuthStore.currentId}`); break;
            case "feed":
                goTo(`/feed`); break;
            case "chats":
                goTo(`/chats`); break;
            case "events":
                goTo(`/search/events`); break;
            case "users":
                goTo(`/search/profiles`); break;
            case "logout":
                goTo(`/`); break;
        }
    };

    const handleNotificationClick = useCallback((chatId) => {
        if (isNavigatingToChat === chatId) {
            return;
        }
        setIsNavigatingToChat(chatId);
        goTo(`/chats/${chatId}`);
        setTimeout(() => {
            setIsNavigatingToChat(null);
        }, 500);
    }, [goTo, isNavigatingToChat]);

    const handleNotificationFunction = useCallback((func) => {
        setShowNotification(() => func);
    }, []);

    useEffect(() => {
        if (currentId && accessToken) {
            socketRef.current = new WebSocket(`ws://localhost:8000/ws/user/${currentId}`);

            socketRef.current.onopen = () => {
                console.log('WebSocket connection established for notifications.');
            };

            socketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new_message') {
                        console.log('New message notification:', data);
                        // Проверяем, находится ли пользователь в чате, о котором пришло уведомление
                        if (String(data.chatId) !== currentChatIdFromUrl) {
                            console.log('Показываем уведомление, так как пользователь не в этом чате.');
                            if (showNotification) {
                                showNotification(`Новое сообщение от ${data.senderUsername}: ${data.preview}`, 5000, data.chatId);
                            } else {
                                console.warn('showNotification не инициализирована!');
                            }
                        } else {
                            console.log('Пользователь находится в чате, уведомление не показывается.');
                        }
                    }
                } catch (error) {
                    console.error('Error processing notification:', error);
                }
            };

            socketRef.current.onclose = () => {
                console.log('WebSocket connection for notifications closed.');
            };

            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }

        return () => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
            }
        };
    }, [currentId, accessToken, navigate, showNotification, currentChatIdFromUrl]);

    return (

        <Layout>
            <Sider style={{
                overflow: 'auto',
                height: '100vh',
                position: 'sticky',
                insetInlineStart: 0,
                top: 0,
                bottom: 0,
            }}>
                <h1 className="pl-6 pt-2 pb-3 text-white text-4xl">Granite</h1>
                <Menu
                    theme="dark"
                    style={{fontSize: "18px"}}
                    mode="inline"
                    items={topMenuItems}
                    onClick={handleMenuClick}
                />
                <Menu
                    theme="dark"
                    style={{fontSize: "18px", marginTop: "auto"}}
                    mode="inline"
                    items={bottomMenuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Content style={{ overflow: 'initial', backgroundColor: '#3b488c' }}>
                    <NotificationContainer onShowNotification={handleNotificationFunction} onNotificationClick={handleNotificationClick} />
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
});

export default NavLayout;
