import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';

import Message from "utils/messages.js"
import {goTo} from "utils/navigator.js"

import CardLayout from 'components/layouts/CardLayout.jsx';
import AuthStore from 'store/AuthStore.js';
import Validator from 'utils/validation.js';
import {wrapHandleError} from "utils/errors.js";
import {observer} from "mobx-react-lite";
import InputPassword from "components/ui/inputs/InputPassword.jsx";
import InputEmail from "components/ui/inputs/InputEmail.jsx";
import {useState} from "react";

const Registration = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleRegister = async ({ email, password, passwordRepeat }) => {
        setLoading(true);
        if (password !== passwordRepeat) {
            Message.error('Пароли не совпадают!');
            return;
        }
        await wrapHandleError(async () => {
            await AuthStore.register(email, password, passwordRepeat);
            goTo('/');
        })();
        setLoading(false);
    };

    return (
        <CardLayout title="Регистрация" style={{width: "25vw", height: "70vh"}}>

                <Form
                    form={form}
                    name="signup"
                    initialValues={{ remember: true }}
                    onFinish={handleRegister}
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
                        rules={[
                            { required: true, message: 'Введите пароль!' },
                            { validator: Validator.validatePassword },
                        ]}
                    >
                        <InputPassword/>
                    </Form.Item>

                    <Form.Item
                        name="passwordRepeat"
                        rules={[{ required: true, message: 'Повторите пароль!' }]}
                    >
                        <InputPassword placeholder="Повторите пароль"/>
                    </Form.Item>

                    <Form.Item style={{display: "flex", justifyContent: "center"}}>
                        <Button loading={loading} shape="round" block type={"primary"} htmlType="submit" style={{ fontSize: 20, padding: 20}}>
                            Создать профиль
                        </Button>
                        <div style={{ margin: "10px", fontSize: 16, textAlign: "center" }}>
                            <a href="/" className="text-blue-600 hover:underline">Уже есть аккаунт?</a>
                        </div>
                    </Form.Item>
                </Form>

        </CardLayout>
    );
});

export default Registration;
