import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore.js";
import { Avatar, Button, DatePicker, Form, Input, message, Select, Upload } from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";
import NavLayout from "../layouts/NavLayout.jsx";
import SkillsSelector from "../ui/SkillsSelector.jsx";
import dayjs from "dayjs";
import { useWatch } from "antd/es/form/Form.js";

const ProfileEditing = () => {
    const [profileData, setProfileData] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarSrc, setAvatarSrc] = useState(null); // путь к аватарке с сервера
    const [messageApi, contextHolder] = message.useMessage();
    const [formEditing] = Form.useForm();
    const navigate = useNavigate();

    const name = useWatch('name', formEditing);
    const username = useWatch('username', formEditing);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await ProfileStore.getProfile();
                const data = response.data.profile;

                setProfileData(data);
                setAvatarSrc(data.avatar_basename ? `/avatars/${data.avatar_basename}` : null);

                formEditing.setFieldsValue({
                    name: data.name,
                    username: data.username,
                    sex: data.sex,
                    faculty: data.faculty,
                    course: data.course,
                    birthdate: data.birthdate ? dayjs(data.birthdate) : null,
                    skills: data.skills || [],
                });

            } catch (error) {
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
        const fileObj = info?.file?.originFileObj;
        if (!fileObj) {
            messageApi.error('Ошибка при чтении файла!');
            return;
        }

        setAvatarFile(fileObj);
        const url = URL.createObjectURL(fileObj);
        setAvatarSrc(url);
    };

    return (
        <NavLayout>
            {contextHolder}
            <div className="flex justify-center min-h-screen bg-none">
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{ height: '25vh', backgroundColor: 'green' }}>Обложка</div>
                    <div style={{ height: '100px', padding: '0px 50px', backgroundColor: 'blue', display: 'flex' }}>
                        <Upload
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleAvatarChange}
                            accept="image/*"
                        >
                            <div style={{ cursor: 'pointer', width: '100px', height: '100px' }}>
                                <Avatar
                                    size={150}
                                    src={avatarSrc}
                                    icon={!avatarSrc && <UserOutlined />}
                                    style={{ backgroundColor: '#f0f0f0', marginTop: '-50px'}}
                                />
                            </div>
                        </Upload>
                        <h2 style={{ alignSelf: 'center', margin: '0px 60px' }}>
                            <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                                {name || 'Имя'}
                            </span>
                            <br />
                            <span style={{ color: 'gray' }}>
                                @{username || 'username'}
                            </span>
                        </h2>

                        <div style={{ flex: '1', display: 'flex', flexDirection: 'row-reverse' }}>
                            <Button style={{ margin: '10px', alignSelf: 'center', fontSize: "16px" }} icon={<SaveOutlined />}>
                                Сохранить
                            </Button>
                            <Button style={{ margin: '10px', alignSelf: 'center', fontSize: "16px" }}>
                                Отменить
                            </Button>
                        </div>
                    </div>

                    <div style={{ width: "75%", padding: '25px 50px', backgroundColor: 'pink', height: '100%' }}>
                        <Form
                            layout="horizontal"
                            form={formEditing}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                        >
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Form.Item
                                    name="name"
                                    label="Имя"
                                    style={{ flex: 1 }}
                                    rules={[{ required: true, message: 'Введите имя' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="username"
                                    label="Никнейм"
                                    style={{ flex: 1 }}
                                    rules={[{ required: true, message: 'Введите никнейм' }]}
                                >
                                    <Input prefix="@" />
                                </Form.Item>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <Form.Item
                                    name="sex"
                                    label="Пол"
                                    style={{ flex: 1 }}
                                >
                                    <Select
                                        options={[
                                            { value: 'male', label: 'Мужской' },
                                            { value: 'female', label: 'Женский' },
                                            { value: 'other', label: 'Не указан' }
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="birthdate"
                                    label="Дата рождения"
                                    style={{ flex: 1 }}
                                >
                                    <DatePicker style={{ width: '100%' }} placeholder="Дата рождения" />
                                </Form.Item>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
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
                                            { value: 'other', label: 'Не указан' }
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
                                            { value: 4, label: '4 курс' },
                                            { value: 5, label: '5 курс' },
                                            { value: 'other', label: 'Не указан' }
                                        ]}
                                    />
                                </Form.Item>
                            </div>

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
