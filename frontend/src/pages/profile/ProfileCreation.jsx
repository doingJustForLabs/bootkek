import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Avatar, message, Select, DatePicker } from 'antd';
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import ProfileCreationLayout from '../../components/layouts/ProfileCreationLayout.jsx';
import ProfileStore from "../../store/ProfileStore.js";
import Validator from "../../utils/validation.js";
import SkillsSelector from "../../components/ui/SkillsSelector.jsx";

const ProfileCreation = () => {
    const [formStep1] = Form.useForm();
    const [formStep2] = Form.useForm();
    const [formStep3] = Form.useForm();
    const [step, setStep] = useState(1);
    const [isProfileCreated, setIsProfileCreated] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [showSkip, setShowSkip] = useState(true);
    const navigate = useNavigate();

    const handleAvatarChange = (info) => {
        const fileObj = info?.file;
        if (!fileObj) {
            messageApi.error('Ошибка при чтении файла!');
            return;
        }
        setAvatarFile(fileObj);
    };

    const handleNextStep1 = async (values) => {
        try {
            const { name, username } = values;
            if (!isProfileCreated) {
                await ProfileStore.createProfile(name, username);
                setIsProfileCreated(true);
            } else {
                await ProfileStore.updateProfile({ name, username });
            }
            if (avatarFile) {
                await ProfileStore.setAvatar(avatarFile);
            }
            setStep(2);
        } catch (error) {

            messageApi.open({
                type: 'error',
                content: error?.response?.data?.detail || 'Ошибка создания профиля.',
            });

            if (error.response?.status === 401) navigate("/");
        }
    };

    const handleNextStep2 = async () => {
        try {
            const values = await formStep2.validateFields();
            const { sex } = values;
            console.log(sex)

            await ProfileStore.updateProfile({ sex });
            setStep(3);
        } catch (error) {

            messageApi.open({
                type: 'error',
                content: error?.response?.data?.detail || 'Ошибка создания профиля.',
            });

            if (error.response?.status === 401) navigate("/");
        }
    };

    const handleFinish = async () => {
        try {
            const values = await formStep3.validateFields();
            const { faculty, course } = values;

            if (faculty || course) {
                await ProfileStore.updateProfile({ faculty, course });
            }
            navigate("/profile/me");
        } catch (error) {

            messageApi.open({
                type: 'error',
                content: error?.response?.data?.detail || 'Ошибка создания профиля.',
            });

            if (error.response?.status === 401) navigate("/");
        }
    };

    const handleSkip = () => {
        if (step === 2) {
            setStep(3);
        } else {
            navigate("/profile/me");
        }
    };

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

                    <Form.Item
                        name="name"
                        rules={[{ validator: Validator.validateName }]}
                    >
                        <Input placeholder="Имя" prefix={<UserOutlined />} maxLength={50} />
                    </Form.Item>

                    <Form.Item
                        name="username"
                        rules={[{ validator: Validator.validateUsername }]}
                    >
                        <Input placeholder="Никнейм" prefix="@" maxLength={50} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ transition: 'opacity 0.3s' }}>
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
                            <Button shape="square" icon={<ArrowLeftOutlined />} onClick={() => setStep(1)} />
                            {showSkip ? (
                                <Button type="primary" onClick={handleSkip}>Пропустить</Button>
                            ) : (
                                <Button type="primary" onClick={handleNextStep2}>Дальше</Button>
                            )}
                        </div>
                    </Form.Item>
                </Form>
            )}

            {step === 3 && (
                <Form layout="vertical" style={{ justifyItems: 'center' }} form={formStep3} onFinish={handleFinish}>
                    <Form.Item>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Form.Item name="faculty" style={{ flex: 1 }}>
                                <Select
                                    style={{ width: 125 }}
                                    placeholder="Факультет"
                                    options={[
                                        { value: 'ЦиТХИн', label: 'ЦиТХИн' },
                                        { value: 'НПМ', label: 'НПМ' },
                                        { value: 'ХФТ', label: 'ХФТ' },
                                        { value: 'ИПУР', label: 'ИПУР' },
                                        { value: 'ФЕН', label: 'ФЕН' },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item name="course" style={{ flex: 1 }}>
                                <Select
                                    style={{ width: 100 }}
                                    placeholder="Курс"
                                    options={[
                                        { value: 1, label: '1 курс' },
                                        { value: 2, label: '2 курс' },
                                        { value: 3, label: '3 курс' },
                                        { value: 4, label: '4 курс' },
                                    ]}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item>
                            <SkillsSelector />
                        </Form.Item>
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button shape="square" icon={<ArrowLeftOutlined />} onClick={() => setStep(2)} />
                            <Button type="primary" htmlType="submit">Завершить</Button>
                        </div>
                    </Form.Item>
                </Form>
            )}
        </ProfileCreationLayout>
    );
};

export default ProfileCreation;
