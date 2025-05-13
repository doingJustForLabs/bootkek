import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore";
import ProfileLayout from "../../components/layouts/ProfileLayout";
import NavLayout from "../../components/layouts/NavLayout";
import { message } from "antd";

const MyProfile = () => {
    const [profileData, setProfileData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await ProfileStore.getProfile();
                setAvatar(response.data.profile.avatar_basename);
                setProfileData(response.data.profile);
            } catch (error) {
                const status = error.response?.status;

                messageApi.open({
                    type: "error",
                    content: error?.response?.data?.detail || "Ошибка загрузки профиля.",
                });

                if (status === 401) navigate("/");
                else if (status === 404) navigate("/profile/create");
                else navigate("/");
            }
        };

        fetchProfile();
    }, [navigate]);

    return (
        <NavLayout>
            <ProfileLayout
                contextHolder={contextHolder}
                avatar={avatar}
                profileData={profileData}
                isMe={true}
            />
        </NavLayout>
    );
};

export default MyProfile;
