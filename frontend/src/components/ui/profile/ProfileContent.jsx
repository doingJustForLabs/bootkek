import React from "react";
import SkillsList from "./SkillsList";
import FollowersListPreview from "components/ui/profile/FollowersListPreview.jsx";
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
                    Ффффффффффффффффффффффф
                </div>

                <div
                    style={{
                        width: "40%",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            position: "sticky",
                            top: "24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            minHeight: "100%"
                        }}
                    >
                        <div>
                            <h2 style={{fontSize: "20px"}}>Навыки <span style={{fontSize: "16px", color: "gray"}}>{profileData.skills.length}</span></h2>
                            <SkillsList skills={profileData.skills} style={{minHeight: "50%", backgroundColor: "green"}}/>
                        </div>

                        <div>
                            <h2 style={{fontSize: "20px"}}>Подписчики <span style={{fontSize: "16px", color: "gray"}}>{followersData.total_profiles}</span></h2>
                            <FollowersListPreview followers={followersData.profiles}></FollowersListPreview>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileContent;
