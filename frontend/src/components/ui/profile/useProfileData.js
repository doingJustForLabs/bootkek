import { useEffect, useState } from "react";
import ProfileStore from "store/ProfileStore";
import FollowsStore from "store/FollowsStore";
import { wrapHandleError } from "utils/errors";
import { goTo } from "utils/navigator";

export default function useProfileData(userId) {
    const [profileData, setProfileData] = useState(null);
    const [followersData, setFollowersData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                await wrapHandleError(async () => {
                    if (!userId) return goTo("/");
                    const response = await ProfileStore.getProfileByUserId(userId);
                    setProfileData({
                        ...response.data.profile,
                        is_current_user: response.data.is_current_user,
                        is_following: response.data.is_following
                    });
                    await loadFollowers();
                })();
            } catch (e) {
                if (e.response?.status === 404) setNotFound(true);
            }
        };
        load();
    }, [userId]);

    const loadFollowers = async (page = 1, limit = 100) => {
        try {
            const response = await FollowsStore.getFollowersByUserId(userId, limit, page);
            setFollowersData(response.data);
        } catch (e) {
            console.error("Ошибка подписчиков:", e);
        }
    };

    return {
        profileData,
        followersData,
        setProfileData,
        notFound,
        reloadFollowers: loadFollowers
    };
}
