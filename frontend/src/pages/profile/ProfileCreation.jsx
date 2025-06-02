import {useState, useEffect} from 'react';
import { Form, Button, Upload, Avatar, DatePicker } from 'antd';
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ProfileStore from "store/ProfileStore.js";
import Validator from "utils/validation.js";
import Message from "utils/messages.js";
import SkillsSelector from "components/ui/inputs/SelectSkills.jsx";
import CardLayout from "components/layouts/CardLayout.jsx";
import StepProgress from "components/ui/profile/StepProgress.jsx";
import {goTo} from "utils/navigator.js";
import AuthStore from "store/AuthStore.js";
import {wrapHandleError} from "utils/errors.js";
import {observer} from "mobx-react-lite";
import InputName from "components/ui/inputs/InputName.jsx";
import InputUsername from "components/ui/inputs/InputUsername.jsx";
import SelectGender from "components/ui/inputs/SelectGender.jsx";
import SelectFaculty from "components/ui/inputs/SelectFaculty.jsx";
import SelectCourse from "components/ui/inputs/SelectCourse.jsx";

const ProfileCreation = observer(() => {
    const [formStep1] = Form.useForm();
    const [formStep2] = Form.useForm();
    const [formStep3] = Form.useForm();
    const [step, setStep] = useState(1);
    const [isProfileCreated, setIsProfileCreated] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [showSkip, setShowSkip] = useState(true);

    const handleAvatarChange = (info) => {
        const fileObj = info?.file;
        if (!fileObj) {
            Message.error('Ошибка при чтении файла!');
            return;
        }
        setAvatarFile(fileObj);
    };

    const handleNextStep1 = async (values) => {
        await wrapHandleError(async () => {
            const { name, username } = values;

            if (!isProfileCreated) {
                await ProfileStore.createProfile(name, username);
                setIsProfileCreated(true);
                const response = ProfileStore.getProfile();
                AuthStore.setCurrentId(response.data?.profile?.user_id);
            } else {
                await ProfileStore.updateProfile({ name, username });
            }
            if (avatarFile) {
                console.log(avatarFile);
                await ProfileStore.setAvatar(avatarFile);
            }
            setStep(2);
        })();
    };

    const handleNextStep2 = async () => {
        await wrapHandleError(async () => {
            const values = await formStep2.validateFields();
            const { sex } = values;

            await ProfileStore.updateProfile({ sex });
            setStep(3);
        })();
    };

    const handleFinish = async () => {
        await wrapHandleError( async () => {
            const values = await formStep3.validateFields();
            const { faculty, course } = values;

            if (faculty || course) {
                await ProfileStore.updateProfile({ faculty, course });
            }

            goTo(`/profile/${AuthStore.id}`);
        })();
    };

    const handleSkip = () => {
        if (step === 2) {
            setStep(3);
        } else {
            goTo(`/profile/${AuthStore.id}`);
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
        <CardLayout title="Создание профиля">
            <StepProgress currentStep={step} />
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

                    <Form.Item name="name" rules={[{ validator: Validator.validateName }]}>
                        <InputName/>
                    </Form.Item>

                    <Form.Item name="username" rules={[{ validator: Validator.validateUsername }]}>
                        <InputUsername/>
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
                        <SelectGender/>
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
                                <SelectFaculty/>
                            </Form.Item>

                            <Form.Item name="course" style={{ flex: 1 }}>
                                <SelectCourse/>
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
        </CardLayout>
    );
});

export default ProfileCreation;
