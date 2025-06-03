import {useState, useEffect} from 'react';
import {Form, Button, Upload, Avatar, DatePicker, Steps} from 'antd';
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ProfileStore from "store/ProfileStore.js";
import Validator from "utils/validation.js";
import Message from "utils/messages.js";
import SkillsSelector from "components/ui/inputs/SelectSkills.jsx";
import CardLayout from "components/layouts/CardLayout.jsx";
import {goTo, goToProfile} from "utils/navigator.js";
import AuthStore from "store/AuthStore.js";
import {wrapHandleError} from "utils/errors.js";
import {observer} from "mobx-react-lite";
import InputName from "components/ui/inputs/InputName.jsx";
import InputUsername from "components/ui/inputs/InputUsername.jsx";
import SelectGender from "components/ui/inputs/SelectGender.jsx";
import SelectFaculty from "components/ui/inputs/SelectFaculty.jsx";
import SelectCourse from "components/ui/inputs/SelectCourse.jsx";
import {getCurrentId, setCurrentId} from "utils/currentId.js";
import ProfileAvatar from "components/profile/ProfileAvatar.jsx";

const ProfileCreation = observer(() => {
    const [formStep1] = Form.useForm();
    const [formStep2] = Form.useForm();
    const [formStep3] = Form.useForm();
    const [step, setStep] = useState(0);
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
                const response = await ProfileStore.getProfile();
                console.log(response.data?.profile?.user_id);
                await setCurrentId(`${response.data?.profile?.user_id}`);
            } else {
                await ProfileStore.updateProfile({ name, username });
            }
            if (avatarFile) {
                await ProfileStore.setAvatar(avatarFile);
            }
            setStep(1);
        })();
    };

    const handleNextStep2 = async (values) => {
        await wrapHandleError(async () => {
            const { sex } = values;

            await ProfileStore.updateProfile({ sex });
            setStep(2);
        })();
    };

    const handleFinish = async (values) => {
        await wrapHandleError( async () => {

            console.log("FINISHED");

            const { faculty, course, skills } = values;

            if (faculty || course || skills) {
                await ProfileStore.updateProfile({ faculty, course, skills });
            }
            goToProfile(getCurrentId());
        })();
    };

    const handleSkip = () => {
        setStep(step + 1);
    };

    const updateSkipLogic = (changedValues, allValues) => {
        if (step === 1) {
            const sexValue = allValues.sex;
            setShowSkip(!sexValue);
            console.log("Значение sex из onValuesChange:", sexValue);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                await wrapHandleError(async () => {
                    const responseProfile = await ProfileStore.getProfile();
                    if (responseProfile.data.profile) {
                        setIsProfileCreated(true);
                        formStep1.setFieldsValue({
                            name: responseProfile.data.profile.name,
                            username: responseProfile.data.profile.username,
                        });
                    }
                })()
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) setIsProfileCreated(false);
            }
        }
        fetchProfile();
    },[]);

    useEffect(() => {
        const initialSex = formStep2.getFieldValue("sex");
        setShowSkip(!initialSex);
        console.log("Начальное значение sex при инициализации:", initialSex);
    }, [formStep2])

    const stepsContent = [
        {
            title: 'Основные данные',
            content: (
                <Form layout="vertical" style={{ justifyItems: 'center' }} form={formStep1} onFinish={handleNextStep1}>
                    <Form.Item>
                        <Upload
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleAvatarChange}
                            accept="image/*"
                        >
                            <ProfileAvatar avatarSize={150} srcFile={avatarFile} onClick={null} style={{cursor: "pointer"}} />
                        </Upload>
                    </Form.Item>

                    <Form.Item name="name" rules={[{ validator: Validator.validateName }]} style={{ width: "70%" }}>
                        <InputName/>
                    </Form.Item>

                    <Form.Item name="username" rules={[{ validator: Validator.validateUsername }]} style={{ width: "70%" }}>
                        <InputUsername/>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ transition: 'opacity 0.3s' }}>
                            Дальше
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            title: 'Личные данные',
            content: (
                <Form layout="vertical" style={{ justifyItems: 'center' }} form={formStep2} onFinish={handleNextStep2} onValuesChange={updateSkipLogic}>

                    <Form.Item name="birthDate" style={{ width: "100%" }}>
                        <DatePicker
                            size="large"
                            style={{ width: '100%' }}
                            placeholder="В РАЗРАБОТКЕ"
                            format="DD.MM.YYYY"
                            placement="bottomLeft"
                        />
                    </Form.Item>

                    <Form.Item name="sex" style={{ width: "100%" }}>
                        <SelectGender/>
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button shape="square" icon={<ArrowLeftOutlined />} onClick={() => setStep(step - 1)} />
                            {showSkip ? (
                                <Button type="primary" onClick={handleSkip}>Пропустить</Button>
                            ) : (
                                <Button type="primary" htmlType="submit">Дальше</Button>
                            )}
                        </div>
                    </Form.Item>
                </Form>
            )
        },
        {
            title: 'Дополнительно',
            content: (
                <Form layout="vertical" style={{ justifyItems: 'center' }} form={formStep3} onFinish={handleFinish}>
                    <Form.Item name="faculty" style={{ width: "100%" }}>
                        <SelectFaculty/>
                    </Form.Item>

                    <Form.Item name="course" style={{ width: "100%" }} >
                        <SelectCourse/>
                    </Form.Item>

                    <Form.Item name="skills" style={{ width: "100%" }}>
                        <SkillsSelector />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button shape="square" icon={<ArrowLeftOutlined />} onClick={() => setStep(step - 1)} />
                            <Button type="primary" htmlType="submit">Завершить</Button>
                        </div>
                    </Form.Item>
                </Form>
            ),
        },
    ]

    const stepsItems = stepsContent.map((item) => ({ key: item.title }));

    return (
        <CardLayout title="Создание профиля">
            <Steps current={step} items={stepsItems}/>
            <div style={{marginTop: "50px"}}>
                {stepsContent[step] && stepsContent[step].content}
            </div>
        </CardLayout>
    );
});

export default ProfileCreation;