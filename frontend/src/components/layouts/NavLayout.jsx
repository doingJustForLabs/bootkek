import React from 'react';
import { UserOutlined, TeamOutlined, LeftCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import AuthStore from "store/AuthStore.js";
import {goTo} from "utils/navigator.js";
import {observer} from "mobx-react-lite";

const { Content, Sider } = Layout;


const NavLayout = observer(({ children }) => {

    const menuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Профиль"
        },
        {
            key: "users",
            icon: <TeamOutlined />,
            label: "Люди"
        },
        {
            key: "chats",
            icon: <MessageOutlined />,
            label: "Чаты"
        },
        {
            key: "logout",
            icon: <LeftCircleOutlined />,
            label: "Выйти",
            danger: true
        }
    ]

    const handleMenuClick = ({ key }) => {
        switch (key){
            case "profile":
                goTo(`/profile/${AuthStore.currentId}`); break;
            case "users":
                goTo(`/search/profiles`); break;
            case "chats":
                goTo(`/chat`); break;
            case "logout":
                goTo(`/`); break;
        }
    };

    return (
        <Layout>
            <Sider breakpoint="lg" collapsedWidth="0">
                <h1 className="p-2 text-white text-3xl">Granite</h1>
                <Menu
                    theme="dark"
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Content>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
});

export default NavLayout;
