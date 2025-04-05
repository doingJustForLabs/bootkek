import {API} from "../services/api.js";
import axios from "axios";

import { useAuth } from "./AuthContext";

import AuthLayout from "../layouts/AuthLayout";
import React from 'react';
import { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex, message } from 'antd';

import { Navigate, useNavigate} from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async ({ email, password }) => {
        setLoading(true);
        try {
            await login(email, password);
            message.success('Вход выполнен успешно!');
        } catch (error) {
            message.error('Ошибка входа. Проверьте данные.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthLayout>
            <div className="m-5">
                <h2 className="text-muctr text-2xl">ДОБРО ПОЖАЛОВАТЬ!</h2>
                <h3 className="text-muctr text-xl justify-self-end">...а вы кто?</h3>
            </div>
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                style={{ maxWidth: 360 }}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Логин" autoComplete="username"/>
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input prefix={<LockOutlined />} type="password" placeholder="Пароль" autoComplete="current-password"/>
                </Form.Item>
                <Form.Item>
                    <Flex justify="end">
                        <a href="/reset">Забыл пароль :C</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button loading={loading} block type="primary" htmlType="submit">
                        Войти
                    </Button>
                    <div className="justify-self-end">
                        или <a href="/signup">Создать профиль!</a>
                    </div>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Login;
