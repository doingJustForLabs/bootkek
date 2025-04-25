import {Form, Button, message, Select} from 'antd';
import ProfileCreationLayout from "../layouts/ProfileCreationLayout.jsx";
import ProfileStore from "../../store/ProfileStore.js";
import {useNavigate} from "react-router-dom";

const ProfileStepTwo = () => {

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();

    const handleNext = async () => {
        try {
            const values = await form.validateFields();

            const { sex } = values;

            await ProfileStore.updateProfile({sex: sex}).then(
                async () => {
                    navigate("/profile");
                }
            );

        } catch (error) {
            messageApi.open({
                type: 'error',
                content: `Ошибка! ${error.response.status}`
            });
        }
    };

    return (
        <ProfileCreationLayout step={2}>
            {contextHolder}
            <Form layout="vertical" form={form}>

                <Form.Item
                    name="sex"
                >
                    <Select options={[{ value: 'male', label: <span>Мужчина</span> }, { value: 'female', label: <span>Женщина</span> }, { value: 'other', label: <span>Некто</span> }]} placeholder={"Пол"} />;
                </Form.Item>

                <Form.Item style={{ justifyItems: 'center' }}>
                    <Button type="primary" onClick={handleNext} loading={uploading}>
                        Дальше
                    </Button>
                </Form.Item>
            </Form>
        </ProfileCreationLayout>
    );
};

export default ProfileStepTwo;
