import React from 'react';
import { UserOutlined, TeamOutlined, LeftCircleOutlined, NotificationOutlined, CommentOutlined, CarryOutOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import AuthStore from "store/AuthStore.js";
import {goTo} from "utils/navigator.js";
import {observer} from "mobx-react-lite";

const { Content, Sider } = Layout;

const NavLayout = observer(({ children }) => {

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
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
});

export default NavLayout;
