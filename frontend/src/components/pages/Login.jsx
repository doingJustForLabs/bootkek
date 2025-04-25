import { useNavigate } from 'react-router-dom';

import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex, message } from 'antd';
import AuthLayout from "../layouts/AuthLayout.jsx";

import AuthStore from "../../store/AuthStore.js";
import * as token from "../../store/utils/token.js";

const Login = () => {

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        const { email, password } = values;
        try {
            await AuthStore.login(email, password).then(async () => {
                const accessToken = token.getAccessToken();
                if (accessToken) {
                    navigate("/profile");
                }
            });
        } catch (error) {
            var messageText = "";
            switch (error.response.status) {
                case 400: messageText = "Пользователь не зарегистирован!"; break;
                default: messageText = `Ошибка! ${error.response.status}`; break;
            }

            messageApi.open({
                type: 'error',
                content: messageText,
            });
        }
    };

    return (
        <AuthLayout>
            {contextHolder}
            <div className="m-5">
                <h2 className="text-muctr text-2xl">ДОБРО ПОЖАЛОВАТЬ!</h2>
                <h3 className="text-muctr text-xl justify-self-end">...а вы кто?</h3>
            </div>
            <Form
                form={form}
                name="login"
                initialValues={{ remember: true }}
                style={{ maxWidth: 360 }}
                onFinish={handleLogin}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Введите адрес электронной почты!' }]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Логин" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль!' }]}
                >
                    <Input.Password prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                </Form.Item>
                <Form.Item>
                    <Flex justify="end">
                        <a href="/reset">Забыл пароль :C</a>
                    </Flex>
                </Form.Item>
                <Form.Item>
                    <Button block type="primary" htmlType="submit">
                        Войти
                    </Button>
                    <div className="justify-self-end mt-2">
                        или <a href="/registration">Создать профиль!</a>
                    </div>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Login;
