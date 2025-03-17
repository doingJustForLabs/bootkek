import {API} from "../services/api.js";
import axios from "axios";

import { useAuth } from "./AuthContext";

import AuthLayout from "../layouts/AuthLayout";
import React from 'react';
import { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex } from 'antd';

import { Navigate, useNavigate} from 'react-router-dom';

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");
    
    const { setAccessToken } = useAuth();

    let navigate = useNavigate();

    const loginButton = () => {
        API.post('/auth/login', {
            email: email,
            password: password
        }).then(response => setAccessToken(response.data.access_token));
        navigate("/profile");
    }


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
                    <Input onChange={(e) => setEmail(e.target.value)} prefix={<UserOutlined />} placeholder="Логин" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input onChange={(e) => setPwd(e.target.value)} prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                </Form.Item>
                <Form.Item>
                    <Flex justify="end">
                        <a href="/reset">Забыл пароль :C</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button onClick={loginButton} block type="primary" htmlType="submit">
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
