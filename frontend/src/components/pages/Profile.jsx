import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore.js";
import {Avatar} from "antd";
import {UserOutlined} from "@ant-design/icons";

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await ProfileStore.getProfile();
                setAvatar(response.data.profile.avatar_basename);
                setProfileData(response.data.profile);
            } catch (error) {
                switch (error.response?.status) {
                    case 401: navigate("/"); break;
                    case 425: navigate("/newprofile"); break;
                    default: navigate("/"); break;
                }
            }
        };

        fetchProfile();
    }, []);


    return (
        <div className="flex items-center justify-center min-h-screen bg-[url(/assets/muctr-bg.png)]">
            <div className="text-black justify-self-start w-full max-w-sm p-8 rounded-4xl bg-white shadow-md">
                <img className="w-3/5 m-6" src="/assets/muctr-logo.png" alt="РХТУ-лого" />
                {profileData?.name}
                <div style={{ width: '100px', height: '100px' }}>
                    <Avatar
                        size={100}
                        src={avatar ? `http://127.0.0.1:8000/${avatar}_256.jpg` : undefined}
                        icon={!avatar && <UserOutlined />}
                        style={{ backgroundColor: '#f0f0f0' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
