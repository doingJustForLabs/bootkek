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
import ProfileHeader from "components/profile/ProfileHeader.jsx";
import Placeholder from "components/ui/Placeholder.jsx";

const ProfileEditing = () => {
    const [profileData, setProfileData] = useState(null);

    const [avatarFile, setAvatarFile] = useState(null);
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

            const updatedFields = {};

            if (name !== profileData.name) updatedFields.name = name;
            if (username !== profileData.username) updatedFields.username = username;
            if (sex !== profileData.sex) updatedFields.sex = sex;
            if (faculty !== profileData.faculty) updatedFields.faculty = faculty;
            if (course !== profileData.course) updatedFields.course = course;
            if ( skills.toString() !== profileData.skills.toString()) updatedFields.skills = skills;

            console.log(updatedFields);

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

    if (!(profileData)) {
        return (
            <NavLayout>
                <Placeholder loading={true}/>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div
                style={{
                    width: "80%",
                    display: "flex",
                    flexDirection: "column",
                    margin: '0 auto',
                }}
            >
                <ProfileHeader
                    profileData={profileData}
                    context={"edit"}
                    actions={{handleSave, handleAvatarChange, getAvatarFile: () => {return avatarFile}}}
                />

                <div style={{ width: "100%", padding: '25px 80px', backgroundColor: '#f4f4f4', minHeight: "75vh" }}>
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
        </NavLayout>
    );
};

export default ProfileEditing;
