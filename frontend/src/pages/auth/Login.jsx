import { useNavigate } from 'react-router-dom';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';

import AuthLayout from '../../components/layouts/AuthLayout.jsx';
import AuthStore from '../../store/AuthStore.js';
import * as token from '../../utils/token.js';

const Login = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const handleLogin = async ({ email, password }) => {
        try {
            await AuthStore.login(email, password);
            const accessToken = token.getAccessToken();

            if (accessToken) {
                navigate(`/profile/me`);
            }
        } catch (error) {
            console.error(error);
            messageApi.open({
                type: 'error',
                content: error?.response?.data?.detail || 'Ошибка авторизации.',
            });
        }
    };

    return (
        <AuthLayout>
            {contextHolder}
            <div className="m-5">
                <h2 className="text-muctr text-2xl">АВТОРИЗАЦИЯ</h2>
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
                    <Input.Password
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Пароль"
                        maxLength={30}
                    />
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit">
                        Войти
                    </Button>
                    <div className="mt-2 text-right">
                        или <a href="/registration">создать профиль!</a>
                    </div>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Login;
