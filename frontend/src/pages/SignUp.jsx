import axios from "axios";

import AuthLayout from "../layouts/AuthLayout";
import React, { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex } from 'antd';


const SignUp = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");

    const signUpButton = () => {
        axios.post('http://127.0.0.1:8000/api/users', {
            name: name,
            email: email,
            password: password
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
                    name="username"
                    rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                    <Input onChange={(e) => setName(e.target.value)} prefix={<UserOutlined />} placeholder="Логин" />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Please input ypur email!' }]}
                >
                    <Input onChange={(e) => setEmail(e.target.value)} prefix={<UserOutlined />} placeholder="Почта" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input onChange={(e) => setPwd(e.target.value)} prefix={<LockOutlined />} type="password" placeholder="Пароль" />
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