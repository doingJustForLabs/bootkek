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


const Login = observer(() => {
    const [form] = Form.useForm();

    const handleLogin = async ({ email, password }) => {
        try {
            await wrapHandleError(async () => {
                await AuthStore.login(email, password);
                const accessToken = token.getAccessToken();

                if (accessToken) {
                    await ProfileStore.getProfile().then((response) => {
                        const userId = response.data?.profile?.user_id;
                        if (userId !== undefined) {
                            AuthStore.setCurrentId(response.data?.profile?.user_id)
                            goTo(`/profile/${AuthStore.currentId}`);
                        }
                    });
                }})()
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) goTo("/profile/create");
        }
    };

    return (
        <CardLayout title={"Granite"}>
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
                    <InputEmail/>
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль!' }]}
                >
                    <InputPassword/>
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
        </CardLayout>
    );
});

export default Login;
