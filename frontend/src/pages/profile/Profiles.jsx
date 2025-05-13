import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileStore from "../../store/ProfileStore.js";
import { message } from "antd";
import NavLayout from "../../components/layouts/NavLayout.jsx";
import ProfilePreview from "../../components/ProfilePreview.jsx";

const Profiles = () => {
    const [profileData, setProfileData] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfiles = async () => {
            setNotFound(false);
            try {
                const responseUser = await ProfileStore.getProfile();
                setProfileData(responseUser.data.profile);
                const response = await ProfileStore.getAllProfiles();
                setProfiles(response.data);
            } catch (error) {
                const status = error.response?.status;

                messageApi.open({
                    type: 'error',
                    content: error?.response?.data?.detail || 'Ошибка загрузки профилей.',
                });

                if (status === 401) navigate("/");
                else if (status === 404) setNotFound(true);
                else navigate("/");
            }
        };

        fetchProfiles();
    }, [navigate]);

    if (notFound) {
        return (
            <NavLayout>
                {contextHolder}
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-gray-600">Профили не найдены...</h1>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout
        userId={profileData?.user_id}>
            {contextHolder}
            <div style={{backgroundColor: '#3b488c', minHeight: '100vh'}}>
                <div className="w-full max-w-4xl space-y-4 p-4">
                    {profiles.length === 0 ? (
                        <div className="text-center text-gray-600 text-xl">Профили не найдены</div>
                    ) : (
                        profiles.map(profile => (
                            <ProfilePreview key={profile.user_id} profileData={profile} />
                        ))
                    )}
                </div>
            </div>
        </NavLayout>
    );
};

export default Profiles;
