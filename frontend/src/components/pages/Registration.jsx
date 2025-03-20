import {API} from "../services/api.js";
import axios from "axios";

import AuthLayout from "../layouts/AuthLayout.jsx";
import React, { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex } from 'antd';


const SignUp = () => {

    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");
    const [passwordRepeat, setPwdRep] = useState("");

    const signUpButton = () => {
        API.post('/auth/register', {
            email: email,
            password: password,
            password_repeat: passwordRepeat
        }).then(response => console.log(response));
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
                    <Button onClick={signUpButton} block type="primary" htmlType="submit">
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

export default SignUp;