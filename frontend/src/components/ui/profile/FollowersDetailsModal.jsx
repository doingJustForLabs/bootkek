import {Modal, Tabs} from "antd";
import ProfilesList from "components/ui/profile/ProfilesList.jsx";
import React, {useEffect, useState} from "react";
import ProfilePreview from "components/ui/profile/ProfilePreview.jsx";
import ButtonUnfollowUser from "components/ui/buttons/ButtonUnfollowUser.jsx";
import {goToProfile} from "utils/navigator.js";
import Pagination from "components/ui/Pagination.jsx";
import {wrapHandleError} from "utils/errors.js";
import FollowsStore from "store/FollowsStore.js";
import ProfileStore from "store/ProfileStore.js";


const FollowersDetailsModal = ({ profileData={}, userId, showFollowersDetailsModal, setShowFollowersDetailsModal}) => {

    const [profiles, setProfiles] = useState([]);
    const [totalFollowers, setTotalFollowers] = useState(0);
    const [totalFollowing, setTotalFollowing] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(5);
    const [activeTab, setActiveTab] = useState("1");

    const fetchProfiles = async (type = "followers", page = 1) => {
        try {
            setCurrentPage(page);
            await wrapHandleError(async () => {

                const response = await ProfileStore.getProfileByUserId(userId);
                setTotalFollowers(response.data.profile.subscribers_count);
                setTotalFollowing(response.data.profile.subscriptions_count);

                if (type === "followers") {
                    const response = await FollowsStore.getFollowersByUserId(userId, limit, page);
                    setProfiles(response.data.profiles);
                    setTotalPages(response.data.total_pages);
                }
                if (type === "following") {
                    const response = await FollowsStore.getFollowingByUserId(userId, limit, page);
                    setProfiles(response.data.profiles);
                    setTotalPages(response.data.total_pages);
                }
            })();
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) {
                setProfiles([]);
                setTotalPages(1);
            }
        }
    };

    useEffect(() => {
        if (activeTab === "1") {
            fetchProfiles('followers', 1);
        } else {
            fetchProfiles('following', 1);
        }
    }, [userId, activeTab]);

    const handleFollowersPageChange = (newPage) => {
        fetchProfiles('followers', newPage);
    };

    const handleFollowingPageChange = (newPage) => {
        fetchProfiles('following', newPage);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setCurrentPage(1);
    };

    return (
        <Modal
            open={showFollowersDetailsModal}
            width={"50vw"}
            title="Информация о подписках"
            onCancel={() => setShowFollowersDetailsModal(false)}
            footer={null}
        >
            <Tabs
                defaultActiveKey="1"
                type="card"
                size="large"
                onChange={handleTabChange}
                items={[
                    {
                        label: `Подписчики ${totalFollowers}`,
                        key: "1",
                        children:
                            <div>
                                <ProfilesList profilesData={profiles} renderItem={
                                    (profile) => (<ProfilePreview profileData={profile} onAvatarClick={() => {goToProfile(profile.user_id); setShowFollowersDetailsModal(false)}}/>)
                                }/>
                                {totalPages <= 1 ? null : (
                                    <div style={{
                                        justifySelf: "center"
                                    }}>
                                        <Pagination
                                            style={{marginLeft: 'auto'}}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handleFollowersPageChange}
                                        />
                                    </div>)
                                }
                            </div>

                    },
                    {
                        label: `Подписки ${totalFollowing}`,
                        key: "2",
                        children:
                            <div>
                                {profileData.is_current_user ? (
                                    <ProfilesList profilesData={profiles} renderItem={
                                        (profile) => (
                                            <ProfilePreview key={profile.user_id} onAvatarClick={() => {goToProfile(profile.user_id); setShowFollowersDetailsModal(false)}} profileData={profile}>
                                                <ButtonUnfollowUser onRefresh={() => fetchProfiles("following", currentPage)} targetUserId={profile.user_id} showTip={true} shape="circle" style={{marginLeft: "auto"}}/>
                                            </ProfilePreview>)
                                    }/>
                                ) : (
                                    <ProfilesList profilesData={profiles} renderItem={
                                        (profile) => (<ProfilePreview profileData={profile} onAvatarClick={() => {goToProfile(profile.user_id); setShowFollowersDetailsModal(false)}}/>)
                                    }/>
                                )}

                                {totalPages <= 1 ? null : (
                                    <div style={{
                                        justifySelf: "center"
                                    }}>
                                    <Pagination
                                        style={{marginLeft: 'auto'}}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handleFollowingPageChange}
                                    />
                                    </div>)
                                }
                            </div>

                    }
                ]}


            />
        </Modal>
    );
};

export default FollowersDetailsModal;