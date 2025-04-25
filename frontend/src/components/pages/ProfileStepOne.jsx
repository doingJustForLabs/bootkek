import {useState} from 'react';
import { Form, Input, Button, Upload, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import ProfileCreationLayout from '../layouts/ProfileCreationLayout.jsx';
import {useNavigate} from "react-router-dom";
import ProfileStore from "../../store/ProfileStore.js";

const ProfileStepOne = () => {

    const [form] = Form.useForm();
    const [avatarFile, setAvatarFile] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();

    const handleAvatarChange = (info) => {
        const fileObj = info?.file;
        if (!fileObj) {
            messageApi.open({
                type: 'error',
                content: 'Ошибка при чтении файла!',
            });
            return;
        }
        setAvatarFile(fileObj);

        const reader = new FileReader();
        reader.readAsDataURL(fileObj);

    };

    const handleNext = async (values) => {
        try {
            const { name, username } = values;


            await ProfileStore.createProfile(name, username).then(
                async () => {
                    if (avatarFile) {
                        await ProfileStore.setAvatar(avatarFile);
                    }
                    navigate("/newprofile/2");
                }
            );



        } catch (error) {
            if (error.response?.status === 401) navigate("/");

            var messageText = "";
            switch (error.response.status) {
                case 409: messageText = "Такой никнейм уже занят!"; break;
                default: messageText = `Ошибка! ${error.response.status}`; break;
            }

            messageApi.open({
                type: 'error',
                content: messageText,
            });
        }
    };

    return (
        <ProfileCreationLayout step={1}>
            {contextHolder}
            <Form layout="vertical" form={form} onFinish={handleNext}>
                <Form.Item style={{ justifyItems: 'center' }}>
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleAvatarChange}
                        accept="image/*"
                    >
                        <div style={{ cursor: 'pointer', width: '100px', height: '100px' }}>
                            <Avatar
                                size={100}
                                src={avatarFile ? URL.createObjectURL(avatarFile) : undefined}
                                icon={!avatarFile && <UserOutlined />}
                                style={{ backgroundColor: '#f0f0f0' }}
                            />
                        </div>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
                >
                    <Input placeholder="Имя" prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Пожалуйста, введите никнейм' }]}
                >
                    <Input placeholder="Никнейм" prefix="@" />
                </Form.Item>

                <Form.Item style={{ justifyItems: 'center' }}>
                    <Button type="primary" htmlType="submit">
                        Дальше
                    </Button>
                </Form.Item>
            </Form>
        </ProfileCreationLayout>
    );
};

export default ProfileStepOne;
