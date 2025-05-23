import { useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore";
import NavLayout from "../../components/layouts/NavLayout";
import Message from "../../utils/messages.js";
import FollowsStore from "store/FollowsStore.js";
import {wrapHandleError} from "utils/errors.js";
import {goTo} from "utils/navigator.js";
import ProfileHeader from "components/ui/ProfileHeader.jsx";
import SkillsList from "components/ui/SkillsList.jsx";

const Profile = () => {
    const userId = Number(useParams().userId);
    const [profileData, setProfileData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                await wrapHandleError(async () => {
                    if (userId) {
                        const response = await ProfileStore.getProfileByUserId(userId);
                        setProfileData({...response.data.profile,
                                            is_current_user: response.data.is_current_user,
                                            is_following: response.data.is_following});
                    } else {
                        goTo('/');
                    }
                })()
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) setNotFound(true);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleFollow = async () => {
        await wrapHandleError(async () => {
            if (profileData.is_following) {
                await FollowsStore.unfollowByUserId(userId);
                setProfileData({...profileData, is_following: false});
                Message.success("Вы отписались от пользователя");
            } else {
                await FollowsStore.followByUserId(userId);
                setProfileData({...profileData, is_following: true});
                Message.success("Вы подписались на пользователя");
            }
        })()
    };

    if (notFound) {
        return (
            <NavLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-gray-600">Такого профиля не существует...</h1>
                </div>
            </NavLayout>
        );
    }

    if (!profileData) {
        return (
            <NavLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-gray-600">Загрузка профиля...</h1>
                </div>
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
                        backgroundColor: "#3b488c",
                    }}
                >
                    <ProfileHeader
                        context={profileData.is_current_user ? "ME" : null}
                        profileData={profileData}
                        handlerFunc = {profileData.is_current_user ? null : handleFollow}
                    />

                    <SkillsList skills={['C++', 'Python', 'JavaScript', 'React', 'SQL', 'Git', 'Docker', 'Java', 'C#', 'C']}></SkillsList>

                </div>
        </NavLayout>
    );
};

export default Profile;
