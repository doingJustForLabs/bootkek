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



//     const [email, setEmail] = useState("");
//     const [password, setPwd] = useState("");
//
//     const { setAccessToken } = useAuth();
//
//     let navigate = useNavigate();
//
//     const loginButton = () => {
//         API.post('/auth/login', {
//             email: email,
//             password: password
//         }).then(response => setAccessToken(response.data.access_token));
//         navigate("/profile");
//     }


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
                    // name="username"
                    rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Логин" autoComplete="username"/>
{/* //                     <Input onChange={(e) => setEmail(e.target.value)} prefix={<UserOutlined />} placeholder="Логин" /> */}
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input prefix={<LockOutlined />} type="password" placeholder="Пароль" autoComplete="current-password"/>
{/* //                     <Input onChange={(e) => setPwd(e.target.value)} prefix={<LockOutlined />} type="password" placeholder="Пароль" /> */}
                </Form.Item>
                <Form.Item>
                    <Flex justify="end">
                        <a href="/reset">Забыл пароль :C</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button loading={loading} block type="primary" htmlType="submit">
{/* //                     <Button onClick={loginButton} block type="primary" htmlType="submit"> */}
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