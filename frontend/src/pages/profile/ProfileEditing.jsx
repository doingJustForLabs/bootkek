import {useState, useEffect} from 'react';
import ProfileStore from "store/ProfileStore.js";
import { Avatar, Button, Form, Upload } from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";
import NavLayout from "components/layouts/NavLayout.jsx";
import SkillsSelector from "components/ui/inputs/SelectSkills.jsx";
import Validator from "utils/validation.js";
import { useWatch } from "antd/es/form/Form.js";
import Message from "utils/messages.js";
import {goTo} from "utils/navigator.js";
import {wrapHandleError} from "utils/errors.js";
import InputName from "components/ui/inputs/InputName.jsx";
import InputUsername from "components/ui/inputs/InputUsername.jsx";
import SelectGender from "components/ui/inputs/SelectGender.jsx";
import SelectFaculty from "components/ui/inputs/SelectFaculty.jsx";
import SelectCourse from "components/ui/inputs/SelectCourse.jsx";

const ProfileEditing = () => {
    const [profileData, setProfileData] = useState(null);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarBase, setAvatarBase] = useState(null);
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);

    const [formEditing] = Form.useForm();

    const name = useWatch('name', formEditing);
    const username = useWatch('username', formEditing);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                await wrapHandleError( async () => {
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
                        skills: profile.skills,
                    });
                })();
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) goTo("/profile/create");
            }
        };

        fetchProfile();
    }, [formEditing]);

    const handleAvatarChange = (info) => {
        const fileObj = info?.file;
        if (!fileObj) {
            Message.error('Ошибка при чтении файла!');
            return;
        }
        setAvatarFile(fileObj);
        setIsAvatarChanged(true);
    };

    const handleSave = async () => {
        await wrapHandleError( async () => {
            const values = await formEditing.validateFields();
            const {name, username, sex, faculty, course, skills} = values;

            console.log(values);

            const updatedFields = {};

            if (name !== profileData.name) updatedFields.name = name;
            if (username !== profileData.username) updatedFields.username = username;
            if (sex !== profileData.sex) updatedFields.sex = sex;
            if (faculty !== profileData.faculty) updatedFields.faculty = faculty;
            if (course !== profileData.course) updatedFields.course = course;
            if (skills !== profileData.skills) updatedFields.skills = skills;

            const isDataChanged = Object.keys(updatedFields).length > 0 || isAvatarChanged;

            if (!isDataChanged) {
                Message.warning("Данные не были изменены!");
                return;
            }

            if (Object.keys(updatedFields).length > 0) {
                await ProfileStore.updateProfile(updatedFields);
            }

            if (isAvatarChanged) {
                await ProfileStore.setAvatar(avatarFile);
            }

            Message.success("Профиль успешно обновлен!");
            goTo(`/profile/${profileData.user_id}`);
        })();
    };


    return (
        <NavLayout>
            <div style={{
                display: "flex",
                minHeight: "100vh",
                justifyContent: "center",
                backgroundColor: "#3b488c"
            }}>
                <div style={{
                    width: "80%",
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
                                    onClick={() => {goTo(`/profile/${profileData.user_id}`)}}>
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
                                <InputName/>
                            </Form.Item>

                            <Form.Item
                                name="username"
                                label="Никнейм"
                                rules={[{ validator: Validator.validateUsername }]}
                                style={{ flex: 1 }}
                            >
                                <InputUsername/>
                            </Form.Item>

                            <Form.Item
                                name="sex"
                                label="Пол"
                                style={{  flex: 1 }}
                            >
                                <SelectGender/>
                            </Form.Item>


                            <Form.Item
                                name="faculty"
                                label="Факультет"
                                style={{ flex: 1 }}
                            >
                                <SelectFaculty/>
                            </Form.Item>

                            <Form.Item
                                name="course"
                                label="Курс"
                                style={{ flex: 1 }}
                            >
                                <SelectCourse/>
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
