import {Form, Button, message, Select, DatePicker} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ProfileCreationLayout from "../layouts/ProfileCreationLayout.jsx";
import ProfileStore from "../../store/ProfileStore.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProfileStepTwo = () => {

    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const [showSkip, setShowSkip] = useState(true);

    useEffect(() => {
        const handleChange = () => {
            const { sex, birthDate } = form.getFieldsValue();
            const bothEmpty = !sex && !birthDate;
            setShowSkip(bothEmpty);
        };

        handleChange();

        const unsubscribe = form.subscribe?.({
            values: handleChange
        });

        return () => unsubscribe?.unsubscribe?.();
    }, [form]);

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            const { sex, birthDate } = values;

            await ProfileStore.updateProfile({
                sex,
                birthDate: birthDate ? birthDate.toISOString() : null
            });

            navigate("/profile");

        } catch (error) {
            messageApi.open({
                type: 'error',
                content: `Ошибка! ${error?.response?.status || 'Неверные данные'}`
            });
        }
    };

    const handleSkip = () => {
        navigate("/profile");
    };

    return (
        <ProfileCreationLayout step={2}>
            {contextHolder}
            <Form layout="vertical" style={{ justifyItems: 'center' }} form={form} onValuesChange={() => {
                const { sex, birthDate } = form.getFieldsValue();
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
                            onClick={() => navigate("/newprofile/1")}
                        />
                        {showSkip ? (
                            <Button type="primary" onClick={handleSkip}>
                                Пропустить
                            </Button>
                        ) : (
                            <Button type="primary" onClick={handleNext}>
                                Дальше
                            </Button>
                        )}
                    </div>
                </Form.Item>
            </Form>
        </ProfileCreationLayout>
    );
};

export default ProfileStepTwo;
