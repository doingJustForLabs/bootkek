import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore.js";

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await ProfileStore.getProfile();
                setProfileData(data);
            } catch (error) {
                switch (error.response?.status) {
                    case 401: navigate("/"); break;
                    case 425: navigate("/newprofile/1"); break;
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
            </div>
        </div>
    );
};

export default Profile;
