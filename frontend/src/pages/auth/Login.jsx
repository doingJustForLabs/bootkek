import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input} from 'antd';

import CardLayout from 'components/layouts/CardLayout.jsx';
import AuthStore from 'store/AuthStore.js';
import * as token from 'utils/token.js';
import ProfileStore from "store/ProfileStore.js";
import {goTo} from "utils/navigator.js";
import {wrapHandleError} from "utils/errors.js";
import {observer} from "mobx-react-lite";
import InputPassword from "components/ui/inputs/InputPassword.jsx";
import InputEmail from "components/ui/inputs/InputEmail.jsx";
import {getCurrentId, setCurrentId} from "utils/currentId.js";
import {useState} from "react";


const Login = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            await wrapHandleError(async () => {
                await AuthStore.login(email, password);
                const accessToken = token.getAccessToken();

                if (accessToken) {
                    await ProfileStore.getProfile().then(async (response) => {
                        const userId = response.data?.profile?.user_id;
                        if (userId !== undefined) {
                            await setCurrentId(`${userId}`)
                            goTo(`/profile/${getCurrentId()}`);
                        }
                    });
                }})()
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) goTo("/profile/create");
        }
        setLoading(false);
    };

    return (
        <CardLayout title="Авторизация" style={{width: "25vw", height: "70vh"}}>
            <Form
                form={form}
                name="login"
                initialValues={{ remember: true }}
                onFinish={handleLogin}
                style={{ width: "100%" }}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Введите адрес электронной почты!' }]}
                >
                    <InputEmail/>
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль!' }]}
                >
                    <InputPassword/>
                </Form.Item>

                <Form.Item style={{ display: "flex", justifyContent: "center" }}>
                    <Button loading={loading} shape="round" block type={"primary"} htmlType="submit" style={{ fontSize: 20, padding: 20}}>
                        Войти
                    </Button>
                    <div style={{ margin: "10px", fontSize: 16, textAlign: "center" }}>
                        <a href="/registration">Нет аккаунта?</a>
                    </div>
                </Form.Item>
            </Form>
        </CardLayout>
    );
});

export default Login;
