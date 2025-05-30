import { useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore";
import NavLayout from "../../components/layouts/NavLayout";
import Message from "../../utils/messages.js";
import FollowsStore from "store/FollowsStore.js";
import {wrapHandleError} from "utils/errors.js";
import {goTo} from "utils/navigator.js";
import ProfileHeader from "components/ui/profile/ProfileHeader.jsx";
import ProfileContent from "components/ui/profile/ProfileContent.jsx"

const Profile = () => {
    const userId = Number(useParams().userId);
    const [profileData, setProfileData] = useState(null);
    const [followersData, setFollowersData] = useState(null);
    const [followingsData, setFollowingsData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                await wrapHandleError(async () => {
                    if (userId) {
                        const responseProfile = await ProfileStore.getProfileByUserId(userId);
                        setProfileData({...responseProfile.data.profile,
                            is_current_user: responseProfile.data.is_current_user,
                            is_following: responseProfile.data.is_following});
                        const responseFollowers = await FollowsStore.getFollowersByUserId(userId, 100, 1);
                        setFollowersData(responseFollowers.data);

                        const responseFollowings = await FollowsStore.getFollowingByUserId(userId, 100, 1);
                        setFollowingsData(responseFollowings.data);

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
                await FollowsStore.unfollowByUserId(profileData.user_id);
                setProfileData({ ...profileData, is_following: false });
                Message.success("Вы отписались от пользователя");
            } else {
                await FollowsStore.followByUserId(profileData.user_id);
                setProfileData({ ...profileData, is_following: true });
                Message.success("Вы подписались на пользователя");
            }
        })();
    };

    if (notFound) {
        return (
            <NavLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-white">Такого профиля не существует...</h1>
                </div>
            </NavLayout>
        );
    }

    if (!(profileData && followersData && followingsData)) {
        return (
            <NavLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-white">Загрузка профиля...</h1>
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
                    margin: '0 auto',
                }}
            >
                <ProfileHeader
                    profileData={profileData}
                    editMode={false}
                    extraActions={handleFollow}
                />

                <ProfileContent
                    profileData={profileData}
                    followersData={followersData}
                    followingsData={followingsData}
                />

            </div>
        </NavLayout>
    );
};

export default Profile;