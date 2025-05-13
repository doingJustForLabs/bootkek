import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileStore from "../../store/ProfileStore.js";
import { Avatar, Button, message } from "antd";
import { UserOutlined, FormOutlined } from "@ant-design/icons";
import NavLayout from "../../components/layouts/NavLayout.jsx";

const Profile = () => {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [isMe, setIsMe] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setNotFound(false);
            try {
                if (userId === "me") {
                    const response = await ProfileStore.getProfile();
                    setAvatar(response.data.profile.avatar_basename);
                    setProfileData(response.data.profile);
                    setIsMe(true);
                } else {
                    const response = await ProfileStore.getProfileByUserId(userId);
                    setAvatar(response.data.profile.avatar_basename);
                    setProfileData(response.data.profile);
                    setIsMe(false);
                }
            } catch (error) {
                const status = error.response?.status;

                if (status === 404 && userId !== "me") {
                    setNotFound(true);
                    return;
                }

                messageApi.open({
                    type: 'error',
                    content: error?.response?.data?.detail || 'Ошибка загрузки профиля.',
                });

                if (status === 401) navigate("/");
                else if (status === 404 && userId === "me") navigate("/profile/create");
                else navigate("/");
            }
        };

        fetchProfile();
    }, [userId, navigate]);

    if (notFound) {
        return (
            <NavLayout>
                {contextHolder}
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-gray-600">Такого профиля не существует...</h1>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            {contextHolder}
            <div className="flex justify-center min-h-screen">
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#3b488c",
                    }}
                >
                    <div style={{ height: '25vh' }} />

                    <div
                        style={{
                            height: '100px',
                            padding: '0px 50px',
                            borderRadius: '30px 30px 0 0',
                            backgroundColor: '#f4f4f4',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar
                            size={150}
                            src={avatar ? `http://127.0.0.1:8000/${avatar}_256.jpg` : undefined}
                            icon={!avatar && <UserOutlined />}
                            style={{ backgroundColor: '#76777c', marginTop: '-50px' }}
                        />
                        <h2 style={{ alignSelf: 'center', margin: '0px 20px' }}>
                            <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                                {profileData?.name}
                            </span>
                            <br />
                            <span style={{ color: 'gray' }}>
                                @{profileData?.username}
                            </span>
                        </h2>

                        <div style={{ flex: '1', display: 'flex', flexDirection: 'row-reverse' }}>
                            {isMe ? (
                                <Button
                                    style={{ margin: '10px', alignSelf: 'center', fontSize: '16px' }}
                                    icon={<FormOutlined />}
                                    onClick={() => navigate("/profile/edit")}
                                >
                                    Редактировать
                                </Button>
                            ) : (
                                <Button
                                    style={{ margin: '10px', alignSelf: 'center', fontSize: '16px' }}
                                    type="primary"
                                >
                                    Подписаться
                                </Button>
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '25px 50px',
                            backgroundColor: '#f4f4f4',
                            height: '100%',
                        }}
                    >
                        Всякая инфа
                    </div>
                </div>
            </div>
        </NavLayout>
    );
};

export default Profile;
