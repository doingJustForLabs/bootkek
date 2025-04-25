import { useNavigate } from 'react-router-dom';

import AuthLayout from "../layouts/AuthLayout.jsx";
import { LockOutlined, MailOutlined} from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';

import AuthStore from "../../store/AuthStore.js";

const Registration = () => {

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();


    const handleRegister = async (values) => {
        const { email, password, passwordRepeat } = values;

        if (password !== passwordRepeat) {
            messageApi.open({
                type: 'error',
                content: 'Пароли не совпадают!',
            });
            return;
        }

        if (password.length < 6) {
            messageApi.open({
                type: 'error',
                content: 'Слишком короткий пароль!',
            });
            return;
        }

        try {
            await AuthStore.register(email, password, passwordRepeat).then(
                () => {navigate("/newprofile/1");}
            );
        } catch (error) {
            var messageText = "";
            switch (error.response.status) {
                case 400: messageText = "Пользователь уже зарегистирован!"; break;
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
            <div className="m-5">
                <h2 className="text-muctr text-xl">ДАВАЙТЕ ЗНАКОМИТЬСЯ!</h2>
            </div>
            <Form
                form={form}
                name="signup"
                initialValues={{ remember: true }}
                style={{ maxWidth: 360 }}
                onFinish={handleRegister}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Введите адрес электронной почты!' }]}
                >
                    <Input placeholder="Почта" prefix={<MailOutlined />}/>
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль!' }]}
                >
                    <Input.Password placeholder="Пароль" prefix={<LockOutlined />}/>
                </Form.Item>

                <Form.Item
                    name="passwordRepeat"
                    rules={[{ required: true, message: 'Повторите пароль!' }]}
                >
                    <Input.Password placeholder="Повторите пароль" prefix={<LockOutlined />}/>
                </Form.Item>

                <Form.Item>
                    {contextHolder}
                    <Button block type="primary" htmlType="submit">
                        Создать профиль
                    </Button>
                    <div className="justify-self-end mt-2">
                        <a href="/">Я уже смешарик!</a>
                    </div>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Registration;
