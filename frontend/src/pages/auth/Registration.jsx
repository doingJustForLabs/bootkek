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

const Registration = observer(() => {
    const [form] = Form.useForm();

    const handleRegister = async ({ email, password, passwordRepeat }) => {
        if (password !== passwordRepeat) {
            Message.error('Пароли не совпадают!');
            return;
        }
        await wrapHandleError(async () => {
            await AuthStore.register(email, password, passwordRepeat);
            goTo('/');
        })();
    };

    return (
        <CardLayout title="Granite">
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

                    <Form.Item className="mb-0">
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
        </CardLayout>
    );
});

export default Registration;
