import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore.js";
import { Avatar, Button, DatePicker, Form, Input, message, Select, Upload } from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";
import NavLayout from "../../components/layouts/NavLayout.jsx";
import SkillsSelector from "../../components/ui/SkillsSelector.jsx";
import Validator from "../../utils/validation.js";
import { useWatch } from "antd/es/form/Form.js";

const ProfileEditing = () => {
    const [profileData, setProfileData] = useState(null);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarBase, setAvatarBase] = useState(null);
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();
    const [formEditing] = Form.useForm();
    const navigate = useNavigate();

    const name = useWatch('name', formEditing);
    const username = useWatch('username', formEditing);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await ProfileStore.getProfile();
                const profile = response.data.profile;

                setAvatarBase(profile.avatar_basename);
                setProfileData(profile);

                formEditing.setFieldsValue({
                    name: profile.name,
                    username: profile.username,
                    sex: profile.sex,
                    faculty: profile.faculty,
                    course: profile.course,
                    // birthdate: profile.birthdate ? dayjs(profile.birthdate) : null,
                    // skills: profile.skills || [],
                });

            } catch (error) {

                messageApi.open({
                    type: 'error',
                    content: error?.response?.statusText || 'Ошибка загрузки профиля.',
                });

                switch (error.response?.status) {
                    case 401: navigate("/"); break;
                    case 404: navigate("/newprofile"); break;
                    default: navigate("/"); break;
                }
            }
        };

        fetchProfile();
    }, [navigate, formEditing]);

    const handleAvatarChange = (info) => {
        const fileObj = info?.file;
        if (!fileObj) {
            messageApi.error('Ошибка при чтении файла!');
            return;
        }
        setAvatarFile(fileObj);
        setIsAvatarChanged(true);
    };

    const handleSave = async () => {
        try {
            const values = await formEditing.validateFields();
            const { name, username, sex, faculty, course } = values;

            const isDataChanged = (
                name !== profileData.name ||
                username !== profileData.username ||
                sex !== profileData.sex ||
                faculty !== profileData.faculty ||
                course !== profileData.course ||
                isAvatarChanged
            );

            if (!isDataChanged) {
                messageApi.warning("Данные не были изменены!");
                return;
            }

            await ProfileStore.updateProfile({
                name,
                username,
                sex,
                faculty,
                course
            });

            if (isAvatarChanged){
                await ProfileStore.setAvatar(avatarFile);
            }

            messageApi.success("Профиль успешно обновлен!");
            navigate("/profile/me");
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error?.response?.data?.detail || 'Ошибка обновления профиля.',
            });
        }
    };


    return (
        <NavLayout>
            {contextHolder}
            <div className="flex justify-center min-h-screen">
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: '#3b488c'
                }}>
                    <div style={{ height: '25vh'}}></div>
                    <div style={{ height: '100px',
                                padding: '0px 50px',
                                borderRadius: '30px 30px 0 0',
                                backgroundColor: '#f4f4f4',
                                display: 'flex',
                                alignItems: 'center', }}>
                        <Upload
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleAvatarChange}
                            accept="image/*"
                        >
                            <div style={{ cursor: 'pointer', width: '100px', height: '100px' }}>
                                <Avatar
                                    size={150}
                                    src={isAvatarChanged ? URL.createObjectURL(avatarFile) : (avatarBase ? `http://127.0.0.1:8000/${avatarBase}_256.jpg` : null)}
                                    icon={!avatarBase && <UserOutlined />}
                                    style={{ backgroundColor: '#76777c', marginTop: '-50px'}}
                                />
                            </div>
                        </Upload>
                        <h2 style={{ alignSelf: 'center', margin: '0px 60px' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {name || 'Имя'}
                            </span>
                            <br />
                            <span style={{ color: 'gray' }}>
                                @{username || 'username'}
                            </span>
                        </h2>

                        <div style={{ flex: '1', display: 'flex', flexDirection: 'row-reverse' }}>
                            <Button style={{ margin: '10px', alignSelf: 'center', fontSize: "16px" }}
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    type="primary"
                            >
                                Сохранить
                            </Button>
                            <Button style={{ margin: '10px', alignSelf: 'center', fontSize: "16px" }}
                                    onClick={() => {navigate('/profile/me')}}>
                                Отменить
                            </Button>
                        </div>
                    </div>

                    <div style={{ width: "100%", padding: '25px 80px', backgroundColor: '#f4f4f4', height: '100%' }}>
                        <Form
                            layout="horizontal"
                            form={formEditing}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            style={{ width: '50%' }}
                        >
                            <Form.Item
                                name="name"
                                label="Имя"
                                rules={[{ validator: Validator.validateName }]}
                            >
                                <Input maxLength={50} />
                            </Form.Item>

                            <Form.Item
                                name="username"
                                label="Никнейм"
                                rules={[{ validator: Validator.validateUsername }]}
                                style={{ flex: 1 }}
                            >
                                <Input prefix="@" maxLength={50}/>
                            </Form.Item>

                            <Form.Item
                                name="sex"
                                label="Пол"
                                style={{  flex: 1 }}
                            >
                                <Select
                                    options={[
                                        { value: 'male', label: 'Мужской' },
                                        { value: 'female', label: 'Женский' },
                                    ]}
                                />
                            </Form.Item>


                            <Form.Item
                                name="faculty"
                                label="Факультет"
                                style={{ flex: 1 }}
                            >
                                <Select
                                    options={[
                                        { value: 'ЦиТХИн', label: 'ЦиТХИн' },
                                        { value: 'НПМ', label: 'НПМ' },
                                        { value: 'ХФТ', label: 'ХФТ' },
                                        { value: 'ИПУР', label: 'ИПУР' },
                                        { value: 'ФЕН', label: 'ФЕН' },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                name="course"
                                label="Курс"
                                style={{ flex: 1 }}
                            >
                                <Select
                                    options={[
                                        { value: 1, label: '1 курс' },
                                        { value: 2, label: '2 курс' },
                                        { value: 3, label: '3 курс' },
                                        { value: 4, label: '4 курс' }
                                    ]}
                                />
                            </Form.Item>


                            <Form.Item label="Навыки" name="skills">
                                <SkillsSelector />
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </NavLayout>
    );
};

export default ProfileEditing;
