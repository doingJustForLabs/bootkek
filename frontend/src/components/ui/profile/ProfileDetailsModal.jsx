import { Modal, Descriptions, Avatar, Tag } from "antd";
import dayjs from "dayjs";

const ProfileDetailsModal = ({ showDetailsModal, setShowDetailsModal, profileData }) => {
    if (!profileData) return null;

    const {
        name,
        username,
        course,
        sex,
        faculty,
        avatar_basename,
        subscribers_count,
        subscriptions_count,
        skills,
        create_date
    } = profileData;

    return (
        <Modal
            open={showDetailsModal}
            title="Информация о профиле"
            onCancel={() => setShowDetailsModal(false)}
            footer={null}
        >
            <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Имя">{name}</Descriptions.Item>
                <Descriptions.Item label="Никнейм">@{username}</Descriptions.Item>
                <Descriptions.Item label="Пол">{sex === 'male' ? 'Мужской' : 'Женский'}</Descriptions.Item>
                <Descriptions.Item label="Факультет">{faculty}</Descriptions.Item>
                <Descriptions.Item label="Курс">{course}</Descriptions.Item>
                <Descriptions.Item label="Навыки">
                    {skills && skills.length > 0 ? (
                        skills.map((skill, index) => (
                            <Tag color="blue" key={index} style={{margin: "2px"}}>{skill}</Tag>
                        ))
                    ) : (
                        <span>Нет</span>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Подписчиков">{subscribers_count}</Descriptions.Item>
                <Descriptions.Item label="Подписок">{subscriptions_count}</Descriptions.Item>
                <Descriptions.Item label="Профиль создан">{dayjs(create_date).format("DD.MM.YYYY HH:mm")}</Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ProfileDetailsModal;
