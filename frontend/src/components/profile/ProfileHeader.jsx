import React, {act, useState} from "react";
import {Avatar, Button, Modal, Tooltip, Upload} from "antd";
import {
    UserOutlined,
    FormOutlined,
    UserAddOutlined,
    UserDeleteOutlined, InfoCircleOutlined, SaveOutlined, CloseOutlined
} from "@ant-design/icons";
import {goTo} from "utils/navigator.js";
import ProfileDetailsModal from "components/profile/modals/ProfileDetailsModal.jsx";
import ButtonEditProfile from "components/ui/buttons/ButtonEditProfile.jsx";
import ButtonFollowUser from "components/ui/buttons/ButtonFollowUser.jsx";
import ProfileButtonsPanel from "components/ui/buttons/ProfileButtonsPanel.jsx";
import DetailsButton from "components/ui/buttons/DetailsButton.jsx";
import ProfileAvatar from "components/profile/ProfileAvatar.jsx";

const ProfileHeader = ({ profileData, context = "other", actions}) => {

    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const renderAvatar = () => {

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
