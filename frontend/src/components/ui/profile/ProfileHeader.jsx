import React, {act, useState} from "react";
import {Avatar, Button, Modal, Tooltip, Upload} from "antd";
import {
    UserOutlined,
    FormOutlined,
    UserAddOutlined,
    UserDeleteOutlined, InfoCircleOutlined, SaveOutlined, CloseOutlined
} from "@ant-design/icons";
import {goTo} from "utils/navigator.js";
import ProfileDetailsModal from "components/ui/profile/ProfileDetailsModal.jsx";
import ButtonEditProfile from "components/ui/buttons/ButtonEditProfile.jsx";
import ButtonFollowUser from "components/ui/buttons/ButtonFollowUser.jsx";
import ProfileButtonsPanel from "components/ui/buttons/ProfileButtonsPanel.jsx";
import DetailsButton from "components/ui/buttons/DetailsButton.jsx";
import ProfileAvatar from "components/ui/profile/ProfileAvatar.jsx";

const ProfileHeader = ({ profileData, context = "other", actions}) => {

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const renderButtons = () => {
        console.log(profileData);
        switch (context) {
            case "ME":
                return (
                    <Button
                        style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                        icon={<FormOutlined />}
                        onClick={() => goTo("/profile/edit")}
                    >
                        Редактировать
                    </Button>
                );
            case "EDITING":
                return (
                    <>
                        <Button
                            style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                            onClick={() => {goTo(`/profile/${profileData.user_id}`)}}
                        >
                            Отменить
                        </Button>
                        <Button
                            style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                            icon={<SaveOutlined />}
                            onClick={handlerFunc}
                            type="primary"
                        >
                            Сохранить
                        </Button>
                    </>
                );
            default:
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                            type={profileData.is_following ? "default" : "primary"}
                            danger={profileData.is_following}
                            onClick={handlerFunc}
                        >
                            {profileData.is_following ? "Отписаться" : "Подписаться"}
                        </Button>
                        {extraActions && (
                            <div style={{ marginLeft: '10px' }}>
                                {extraActions}
                            </div>
                        )}
                    </div>
                );
        }
    };

    const renderAvatar = () => {
        const src = profileData.avatar_basename ? `http://127.0.0.1:8000/${profileData.avatar_basename}_256.jpg` : null

        if (context === "edit") return (
            <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={actions.handleAvatarChange}
                accept="image/*"
            >
                <ProfileAvatar
                    profileData={profileData}
                    onClick={null}
                    avatarSize={150}
                    srcFile={actions.getAvatarFile()}
                    style={{ cursor: 'pointer', marginTop: '-30px' }}
                />
            </Upload>
        );

        return (
            <ProfileAvatar
                profileData={profileData}
                onClick={null}
                avatarSize={150}
                style={{ marginTop: '-30px' }}
            />
        );
    };

    return (
        <div>
            <div style={{ height: "15vh" }}></div>
            <div
                style={{
                    height: "10vh",
                    padding: "0px 50px",
                    borderRadius: "50px 50px 0 0",
                    backgroundColor: "#f4f4f4",
                    display: "flex",
                    alignItems: "center",
                    gap: "15px"
                }}
            >
                <div style={{ width: "150px", height: "150px", position: "relative" }}>
                    {renderAvatar()}
                </div>

                <div style={{ flexGrow: 1 }}>
                    <h2 style={{ margin: 0 }}>
                        <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                            {profileData?.name || "Имя"}
                        </span>
                        <br />
                        <span style={{ fontSize: "18px", color: "gray" }}>
                        @{profileData?.username || "username"}
                        {context !== "edit" && (
                            <DetailsButton onClick={() => setShowDetailsModal(true)} style={{color: "gray"}}/>
                        )}
                        </span>
                    </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "row-reverse"}}>
                    <ProfileButtonsPanel profileData={profileData} context={context} actions={actions}/>
                </div>
            </div>

            <ProfileDetailsModal
                showDetailsModal={showDetailsModal}
                setShowDetailsModal={setShowDetailsModal}
                profileData={profileData}
            />

        </div>
    );
};


export default ProfileHeader;
