import { useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore";
import NavLayout from "../../components/layouts/NavLayout";
import FollowsStore from "store/FollowsStore.js";
import {wrapHandleError} from "utils/errors.js";
import {goTo} from "utils/navigator.js";
import ProfileHeader from "components/ui/profile/ProfileHeader.jsx";
import ProfileContent from "components/ui/profile/ProfileContent.jsx"
import Placeholder from "components/ui/Placeholder.jsx";

const Profile = () => {
    const userId = Number(useParams().userId);
    const [profileData, setProfileData] = useState(null);
    const [followersData, setFollowersData] = useState(null);
    const [followingsData, setFollowingsData] = useState(null);
    const [notFound, setNotFound] = useState(false);

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

    useEffect(() => {
        fetchProfile();
    }, [userId]);


    if (notFound) {
        return (
            <NavLayout>
                <Placeholder style={{fontSize: 20, color: "white"}}>Профиль не существует</Placeholder>
            </NavLayout>
        );
    }

    if (!(profileData && followersData && followingsData)) {
        return (
            <NavLayout>
                <Placeholder style={{fontSize: 20, color: "white"}} loading={true}/>
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
                    margin: '0 auto',
                }}
            >
                <ProfileHeader
                    profileData={profileData}
                    context={profileData.is_current_user ? "me" : "other"}
                    actions={{fetchProfile}}
                />

                <ProfileContent
                    profileData={profileData}
                    followersData={followersData}
                    followingsData={followingsData}
                    actions={{fetchProfile}}
                />

            </div>
        </NavLayout>
    );
};

export default Profile;