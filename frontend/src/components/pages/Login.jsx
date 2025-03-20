import {useAuth} from "../../http/AuthContext.jsx";
import AuthService from "../../services/AuthService.js";

import {React} from 'react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex } from 'antd';
import AuthLayout from "../layouts/AuthLayout.jsx";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");

    const [_, setAccessToken] = useAuth();

    const navigate = useNavigate("");

    const LoginButton = () => {
        AuthService.login(email, password)
        .then(response => setAccessToken(response.data.access_token))
        .then(navigate("/profile"));
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
                    name="email"
                    rules={[{ required: true, message: 'Введите адрес электронной почты!' }]}
                >
                    <Input onChange={(e) => setEmail(e.target.value)} prefix={<UserOutlined />} placeholder="Логин" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль!' }]}
                >
                    <Input onChange={(e) => setPwd(e.target.value)} prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                </Form.Item>
                <Form.Item>
                    <Flex justify="end">
                        <a href="/reset">Забыл пароль :C</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button onClick={LoginButton} block type="primary" htmlType="submit">
                        Войти
                    </Button>
                    <div className="justify-self-end">
                        или <a href="/registration">Создать профиль!</a>
                    </div>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Login;
