import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore";
import ProfileLayout from "../../components/layouts/ProfileLayout";
import NavLayout from "../../components/layouts/NavLayout";
import { message } from "antd";

const Profile = () => {
    const userId = Number(useParams().userId);
    const [profileData, setProfileData] = useState(null);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setNotFound(false);
            try {
                const response = await ProfileStore.getProfileByUserId(userId);
                setAvatar(response.data.profile.avatar_basename);
                setProfileData(response.data.profile);
                setIsCurrentUser(response.data.is_current_user)
            } catch (error) {
                const status = error.response?.status;

                if (status === 404) {
                    if (isCurrentUser) {
                        navigate("/profile/create");
                        return;
                    }
                    setNotFound(true);
                    return;
                }

                messageApi.open({
                    type: "error",
                    content: error?.response?.data?.detail || "Ошибка загрузки профиля.",
                });

                if (status === 401) navigate("/");

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
        <NavLayout
            userId={userId}>
            <ProfileLayout
                contextHolder={contextHolder}
                avatar={avatar}
                profileData={profileData}
                isMe={isCurrentUser}
                userId={userId}
            />
        </NavLayout>
    );
};

export default Profile;
