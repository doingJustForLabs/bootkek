import React from 'react';
import { HomeOutlined, TeamOutlined, LeftCircleOutlined, NotificationOutlined, CommentOutlined, CarryOutOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import {goTo} from "utils/navigator.js";
import {getCurrentId} from "utils/currentId.js";
import "styles/ui/NavLayout.css"

const { Content, Sider } = Layout;

const NavLayout = ({ children }) => {

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
                goTo(`/profile/${getCurrentId()}`); break;
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
                <Content className="content">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default NavLayout;
