import React, {useCallback, useEffect, useRef, useState} from 'react';
import { HomeOutlined, TeamOutlined, LeftCircleOutlined, NotificationOutlined, CommentOutlined, CarryOutOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import {goTo} from "utils/navigator.js";
import {getCurrentId} from "utils/currentId.js";
import "styles/ui/NavLayout.css"
import {useParams} from "react-router-dom";
import {getAccessToken} from "utils/token.js";
import NotificationContainer from "components/NotificationContainer.jsx";

const { Content, Sider } = Layout;

const NavLayout = ({ children }) => {
    const { chatId: currentChatIdFromUrl } = useParams();
    const socketRef = useRef(null);
    const accessToken = getAccessToken();
    const [showNotification, setShowNotification] = useState(() => {});
    const [isNavigatingToChat, setIsNavigatingToChat] = useState(null);
    const currentId = getCurrentId();

    const menuItems = [
        {
            key: "profile",
            icon: <HomeOutlined style={{fontSize: 24}}/>,
            label: "Профиль"
        },
        {
            key: "feed",
            icon: <NotificationOutlined style={{fontSize: 24}}/>,
            label: "Новости"
        },
        {
            key: "chats",
            icon: <CommentOutlined style={{fontSize: 24}}/>,
            label: "Чаты"
        },
        {
            key: "events",
            icon: <CarryOutOutlined style={{fontSize: 24}}/>,
            label: "Встречи"
        },
        {
            key: "users",
            icon: <TeamOutlined style={{fontSize: 24}}/>,
            label: "Люди"
        },
        {
            key: "logout",
            icon: <LeftCircleOutlined style={{fontSize: 24}}/>,
            label: "Выйти",
            danger: true
        }
    ];

    const handleMenuClick = ({ key }) => {
        switch (key){
            case "profile":
                goTo(`/profile/${currentId}`); break;
            // case "feed":
            //     goTo(`/feed`); break;
            case "chats":
                goTo(`/chats`); break;
            // case "events":
            //     goTo(`/search/events`); break;
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
    }, [currentId, accessToken, goTo, showNotification, currentChatIdFromUrl]);

    return (
        <Layout className="nav">
            <Sider className="sider">
                <h1 className="logo">Granite</h1>
                <div className="sider-inner">
                    <Menu
                        className="menu"
                        theme="dark"
                        mode="inline"
                        items={menuItems}
                        onClick={handleMenuClick}
                    />
                </div>
            </Sider>
            <Layout>
                <Content style={{ overflow: 'initial', backgroundColor: '#3b488c' }}>
                    <NotificationContainer onShowNotification={handleNotificationFunction} onNotificationClick={handleNotificationClick} />
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default NavLayout;
