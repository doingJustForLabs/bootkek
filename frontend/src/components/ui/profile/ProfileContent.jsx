import React from "react";
import SkillsList from "./SkillsList";
import FollowersListPreview from "components/ui/profile/FollowersListPreview.jsx";
import InfoCard from "components/ui/InfoCard.jsx";
import Post from "components/Post.jsx";
// import FollowersList from "./FollowersList";
// import PostFeed from "./PostFeed";

const ProfileContent = ({ profileData, followersData }) => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "24px 16px",
                backgroundColor: "#f4f4f4",
                flex: 1,
                gap: "16px",
                minHeight: "70vh",
                boxSizing: "border-box",
            }}
        >
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
                            <InfoCard title={"Навыки"} statistics={profileData?.skills?.length}>
                                <SkillsList skills={profileData.skills}/>
                            </InfoCard>

                            <InfoCard title={"Подписчики"} statistics={profileData?.subscribers_count}>
                                <FollowersListPreview followers={followersData.profiles}/>
                            </InfoCard>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileContent;
