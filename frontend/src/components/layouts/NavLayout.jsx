import React from 'react';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;

const NavLayout = ({ children }) => {
    const navigate = useNavigate();

    const icons = [UserOutlined, TeamOutlined];
    const paths = ['/profile/me', '/profiles'];

    const items = ['Профиль', 'Люди'].map((label, index) => ({
        key: String(index), // ключ — индекс
        icon: React.createElement(icons[index]),
        label: label,
    }));

    const handleMenuClick = ({ key }) => {
        navigate(paths[Number(key)]);
    };

    return (
        <Layout>
            <Sider breakpoint="lg" collapsedWidth="0">
                <h1 className="p-2 text-white text-3xl">Granite</h1>
                <Menu
                    theme="dark"
                    mode="inline"
                    items={items}
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
};

export default NavLayout;
