import React, {useEffect, useRef, useState} from "react";
import SkillsList from "./SkillsList";
import InfoCard from "components/ui/InfoCard.jsx";
import Post from "components/Post.jsx";
import ProfilesList from "components/ui/profile/ProfilesList.jsx";
import FollowersDetailsModal from "components/ui/profile/FollowersDetailsModal.jsx";
import ProfilePreview from "components/ui/profile/ProfilePreview.jsx";
import ProfileButtonsPanel from "components/ui/buttons/ProfileButtonsPanel.jsx";
import ProfileAvatar from "components/ui/profile/ProfileAvatar.jsx";

const ProfileContent = ({ profileData, followersData, followingsData, actions }) => {

    const [showFollowersDetailsModal, setShowFollowersDetailsModal] = useState(false)

    const [isPreviewVisible, setIsPreviewVisible] = useState(true);
    const triggerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsPreviewVisible(!entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.01
            }
        );

        const current = triggerRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, []);


    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "24px 16px",
                backgroundColor: "#f4f4f4",
                flex: 1,
                gap: "16px",
                minHeight: "75vh",
                boxSizing: "border-box",
            }}
        >
            <div ref={triggerRef} style={{ height: "1px" }} />
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    flex: 1,
                }}
            >
                <div
                    style={{
                        flex: 1,
                        width: "60%",
                        backgroundColor: "red",
                    }}
                >
                    {/* <PostFeed /> */}
                    <Post></Post>
                    <Post></Post>
                    <Post></Post>
                    <Post></Post>
                    <Post></Post>
                    <Post></Post>
                    <Post></Post>
                </div>

                <div
                    style={{
                        width: "40%",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            top: "24px",
                            height: "100%"
                        }}
                    >

                        <div style={{
                            position: "sticky",
                            top: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}>
                            {isPreviewVisible &&
                                <ProfilePreview profileData={profileData} style={{backgroundColor: '#596acc', color: "white"}} >
                                    <div style={{ display: "flex", flexDirection: "row-reverse", width: "100%"}}>
                                        <ProfileButtonsPanel profileData={profileData} context={profileData.is_current_user ? "me" : "other"} preview={true} actions={actions}/>
                                    </div>
                                </ProfilePreview>}

                            <InfoCard title={"Навыки"} statistics={profileData?.skills?.length}>
                                <SkillsList limit={null} skills={profileData.skills}/>
                            </InfoCard>

                            <InfoCard title={"Подписчики"} statistics={profileData?.subscribers_count} handleDetails={() => {setShowFollowersDetailsModal(true)}}>
                                <ProfilesList style={{ flexDirection: "row", flexWrap: "wrap", gap: "18px", padding: "20px"}}
                                              profilesData={[...followersData.profiles].sort(() => 0.5 - Math.random()).slice(0, 10)}
                                              renderItem={(profile) => (<ProfileAvatar key={profile.user_id} showTip={true} profileData={profile} linked={true} avatarSize={80}/>)
                                }
                                />
                            </InfoCard>
                        </div>

                    </div>
                </div>
            </div>

            <FollowersDetailsModal
                profileData={profileData}
                userId={profileData.user_id}
                showFollowersDetailsModal={showFollowersDetailsModal}
                setShowFollowersDetailsModal={setShowFollowersDetailsModal}
            />

        </div>
    );
};

export default ProfileContent;
