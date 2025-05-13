import { useNavigate } from 'react-router-dom';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';

import AuthLayout from '../../components/layouts/AuthLayout.jsx';
import AuthStore from '../../store/AuthStore.js';
import Validator from '../../utils/validation.js';

const Registration = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const handleRegister = async ({ email, password, passwordRepeat }) => {
        if (password !== passwordRepeat) {
            messageApi.open({
                type: 'error',
                content: 'Пароли не совпадают!',
            });
            return;
        }

        try {
            await AuthStore.register(email, password, passwordRepeat);
            navigate('/');
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error?.response?.statusText || 'Ошибка регистрации.',
            });
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col items-center justify-center py-8 px-4">
                <h2 className="text-2xl font-semibold text-muctr mb-6">РЕГИСТРАЦИЯ</h2>

                <Form
                    form={form}
                    name="signup"
                    initialValues={{ remember: true }}
                    onFinish={handleRegister}
                    className="w-full max-w-sm space-y-4"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Введите адрес электронной почты!' }]}
                    >
                        <Input
                            placeholder="Почта"
                            prefix={<MailOutlined />}
                            className="py-2"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Введите пароль!' },
                            { validator: Validator.validatePassword },
                        ]}
                    >
                        <Input.Password
                            placeholder="Пароль"
                            prefix={<LockOutlined />}
                            maxLength={30}
                            className="py-2"
                        />
                    </Form.Item>

                    <Form.Item
                        name="passwordRepeat"
                        rules={[{ required: true, message: 'Повторите пароль!' }]}
                    >
                        <Input.Password
                            placeholder="Повторите пароль"
                            prefix={<LockOutlined />}
                            maxLength={30}
                            className="py-2"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        {contextHolder}
                        <Button
                            block
                            type="primary"
                            htmlType="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Создать профиль
                        </Button>
                        <div className="mt-3 text-sm text-right">
                            или <a href="/" className="text-blue-600 hover:underline">использовать существующий</a>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </AuthLayout>
    );
};

export default Registration;
