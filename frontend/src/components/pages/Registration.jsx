import AuthService from "../../services/AuthService.js";

import {React, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import AuthLayout from "../layouts/AuthLayout.jsx";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input} from 'antd';



const Registration = () => {

    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");
    const [passwordRepeat, setPwdRep] = useState("");

    const navigate = useNavigate("");

    const RegisterButton = () => {
        AuthService.register(email, password, passwordRepeat)
        .then(response => console.log(response))
        .then(navigate("/profile"));
    }


    return (
        <AuthLayout>
            <div className="m-5">
                <h2 className="text-muctr text-xl">ДАВАЙТЕ ЗНАКОМИТЬСЯ!</h2>
            </div>
            <Form
                name="signup"
                initialValues={{ remember: true }}
                style={{ maxWidth: 360 }}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Введите адрес электронной почты!' }]}
                >
                    <Input onChange={(e) => setEmail(e.target.value)} prefix={<UserOutlined />} placeholder="Почта" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль!' }]}
                >
                    <Input onChange={(e) => setPwd(e.target.value)} prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                </Form.Item>

                <Form.Item
                    name="passwordRepeat"
                    rules={[{ required: true, message: 'Пароли должны совпадать!' }]}
                >
                    <Input onChange={(e) => setPwdRep(e.target.value)} prefix={<LockOutlined />} type="password" placeholder="Повторите пароль" />
                </Form.Item>

                <Form.Item>
                    <Button onClick={RegisterButton} block type="primary" htmlType="submit">
                        Создать профиль
                    </Button>
                    <div className="justify-self-end">
                        или <a href="/">Я уже смешарик</a>
                    </div>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Registration;