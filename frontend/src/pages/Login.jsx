import AuthLayout from "../layouts/AuthLayout";
import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex } from 'antd';

const Login = () => {
    return (
        <AuthLayout>
            <div className="m-5">
                <h2 className="text-muctr text-2xl">ДОБРО ПОЖАЛОВАТЬ!</h2>
                <h3 className="text-muctr text-xl justify-self-end">...а вы кто?</h3>
            </div>
            <Form
                name="login"
                initialValues={{ remember: true }}
                style={{ maxWidth: 360 }}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Логин" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                </Form.Item>
                <Form.Item>
                    <Flex justify="end">
                        <a href="">Забыл пароль :C</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit">
                        Войти
                    </Button>
                    <div className="justify-self-end">
                        или <a href="">Создать профиль!</a>
                    </div>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Login;
