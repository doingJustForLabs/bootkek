import React, {useState} from "react";
import SkillsList from "./SkillsList";
import FollowersListPreview from "components/ui/profile/FollowersListPreview.jsx";
import InfoCard from "components/ui/InfoCard.jsx";
import Post from "components/Post.jsx";
import {Modal, Tabs} from "antd";
import ProfilesList from "components/ui/profile/ProfilesList.jsx";

const ProfileContent = ({ profileData, followersData, followingsData }) => {

    const [showFollowersModal, setShowFollowersModal] = useState(false)

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

                            <InfoCard title={"Подписчики"} statistics={profileData?.subscribers_count} handleDetails={() => {setShowFollowersModal(true)}}>
                                <FollowersListPreview followers={followersData.profiles}/>
                            </InfoCard>
                        </div>

                    </div>
                </div>
            </div>

            <Modal
                open={showFollowersModal}
                title="Информация о подписках..."
                onCancel={() => setShowFollowersModal(false)}
                footer={null}
            >
                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    size="large"
                    items={[
                        {
                            label: "Подписчики",
                            key: "1",
                            children: <ProfilesList profilesData={followersData.profiles} style={{borderRadius:"0px", backgroundColor: null}}/>
                        },
                        {
                            label: "Подписки",
                            key: "2",
                            children: <ProfilesList profilesData={followingsData.profiles} style={{borderRadius:"0px", backgroundColor: null}}/>
                        }
                    ]}


                />
            </Modal>

        </div>
    );
};

export default ProfileContent;
