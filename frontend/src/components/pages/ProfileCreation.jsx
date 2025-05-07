import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Avatar, message, Select, DatePicker } from 'antd';
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import ProfileCreationLayout from '../layouts/ProfileCreationLayout.jsx';
import ProfileStore from "../../store/ProfileStore.js";

const ProfileCreation = () => {
    const [formStep1] = Form.useForm();
    const [formStep2] = Form.useForm();
    const [step, setStep] = useState(1);
    const [avatarFile, setAvatarFile] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [showSkip, setShowSkip] = useState(true);
    const navigate = useNavigate();

    // Аватар
    const handleAvatarChange = (info) => {
        const fileObj = info?.file;
        if (!fileObj) {
            messageApi.error('Ошибка при чтении файла!');
            return;
        }
        setAvatarFile(fileObj);
        const reader = new FileReader();
        reader.readAsDataURL(fileObj);
    };

    // Переход к шагу 2
    const handleNextStep1 = async (values) => {
        try {
            const { name, username } = values;
            await ProfileStore.createProfile(name, username);
            if (avatarFile) {
                await ProfileStore.setAvatar(avatarFile);
            }
            setStep(2);
        } catch (error) {
            if (error.response?.status === 401) navigate("/");

            let messageText = "";
            switch (error.response?.status) {
                case 409: messageText = "Такой никнейм уже занят!"; break;
                case 422: messageText = "Слишком короткий никнейм!"; break;
                default: messageText = `Ошибка! ${error.response?.status}`; break;
            }
            messageApi.error(messageText);
        }
    };

    // Завершение
    const handleFinish = async () => {
        try {
            const values = await formStep2.validateFields();
            const { sex, birthDate } = values;

            await ProfileStore.updateProfile({
                sex,
                birthDate: birthDate ? birthDate.toISOString() : null
            });

            navigate("/profile");
        } catch (error) {
            messageApi.error(`Ошибка! ${error?.response?.status || 'Неверные данные'}`);
        }
    };

    const handleSkip = () => navigate("/profile");

    // Следим за заполненностью второго шага
    useEffect(() => {
        const updateSkip = () => {
            const { sex, birthDate } = formStep2.getFieldsValue();
            setShowSkip(!sex && !birthDate);
        };
        updateSkip();
        const unsubscribe = formStep2.subscribe?.({ values: updateSkip });
        return () => unsubscribe?.unsubscribe?.();
    }, [formStep2]);

    return (
        <ProfileCreationLayout step={step}>
            {contextHolder}

            {step === 1 && (
                <Form layout="vertical" style={{ justifyItems: 'center' }} form={formStep1} onFinish={handleNextStep1}>
                    <Form.Item>
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

                    <Form.Item name="name" rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}>
                        <Input placeholder="Имя" prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item name="username" rules={[{ required: true, message: 'Пожалуйста, введите никнейм' }]}>
                        <Input placeholder="Никнейм" prefix="@" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ transition: 'opacity 0.3s' }}
                            disabled={!formStep1.isFieldsTouched(true) || !!formStep1.getFieldsError().filter(({ errors }) => errors.length).length}
                        >
                            Дальше
                        </Button>
                    </Form.Item>
                </Form>
            )}

            {step === 2 && (
                <Form layout="vertical" style={{ justifyItems: 'center' }} form={formStep2} onValuesChange={() => {
                    const { sex, birthDate } = formStep2.getFieldsValue();
                    setShowSkip(!sex && !birthDate);
                }}>
                    <Form.Item name="birthDate">
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Дата рождения"
                            format="DD.MM.YYYY"
                            placement="bottomLeft"
                        />
                    </Form.Item>

                    <Form.Item name="sex">
                        <Select
                            options={[
                                { value: 'male', label: 'Мужчина' },
                                { value: 'female', label: 'Женщина' },
                            ]}
                            placeholder="Ваш пол"
                        />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                                shape="square"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => setStep(1)}
                            />
                            {showSkip ? (
                                <Button type="primary" onClick={handleSkip}>Пропустить</Button>
                            ) : (
                                <Button type="primary" onClick={handleFinish}>Дальше</Button>
                            )}
                        </div>
                    </Form.Item>
                </Form>
            )}
        </ProfileCreationLayout>
    );
};

export default ProfileCreation;
