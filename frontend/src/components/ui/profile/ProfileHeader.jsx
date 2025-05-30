import React, {useState} from "react";
import {Avatar, Button, Modal, Tooltip, Upload} from "antd";
import {
    UserOutlined,
    FormOutlined,
    UserAddOutlined,
    UserDeleteOutlined, InfoCircleOutlined, SaveOutlined, CloseOutlined
} from "@ant-design/icons";
import {goTo} from "utils/navigator.js";

const ProfileHeader = ({ profileData, extraActions, editMode = false}) => {

    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const renderAvatar = () => {

        const src = profileData.avatar_basename
            ? `http://127.0.0.1:8000/${profileData.avatar_basename}_256.jpg`
            : null;

        if (editMode) return (
            <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={extraActions.handleAvatarChange}
                accept="image/*"
            >
                <div style={{ cursor: 'pointer', width: '100px', height: '100px' }}>
                    <Avatar
                        size={150}
                        src={extraActions.getAvatar()}
                        icon={!src && <UserOutlined />}
                        style={{ backgroundColor: '#76777c', marginTop: '-30px'}}
                    />
                </div>
            </Upload>
        );

        return (
            <Avatar
                size={150}
                src={src}
                icon={!src && <UserOutlined />}
                style={{ backgroundColor: "#76777c", marginTop: "-30px" }}
            />
        );
    };

    const renderButtons = () => {
        if (editMode) {
            return (
                <>
                    <Button
                        size="large"
                        style={{ margin: '5px', alignSelf: 'center', fontSize: "20px" }}
                        icon={<SaveOutlined />}
                        onClick={extraActions.handleSave}
                        type="primary"
                    >
                        Сохранить
                    </Button>
                    <Button
                        size="large"
                        style={{ margin: '5px', alignSelf: 'center', fontSize: "20px" }}
                        icon={<CloseOutlined />}
                        onClick={() => {goTo(`/profile/${profileData.user_id}`)}}
                    />
                </>
            )
        } else {
            return ( profileData.is_current_user ? (
                    <Button
                        size="large"
                        style={{ margin: "5px", alignSelf: "center", fontSize: "20px" }}
                        icon={<FormOutlined />}
                        onClick={() => goTo("/profile/edit")}
                    >
                        Редактировать
                    </Button>
                    )
                    :
                    (
                    <div style={{ flex: "1", display: "flex", flexDirection: "row-reverse" }}>
                        <Button
                            size="large"
                            style={{ margin: "5px", alignSelf: "center", fontSize: "20px" }}
                            icon={profileData.is_following ? <UserDeleteOutlined /> : <UserAddOutlined />}
                            type={profileData.is_following ? "default" : "primary"}
                            danger={profileData.is_following}
                            onClick={extraActions.handleFollow}
                        >
                            {profileData.is_following ? "Отписаться" : "Подписаться"}
                        </Button>
                    </div>)
            )
        }
    };


    return (
        <div>
            <div style={{ height: "15vh" }}></div>
            <div
                style={{
                    height: "10vh",
                    padding: "0px 50px",
                    borderRadius: "30px 30px 0 0",
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
                                    {!editMode && (
                                        <Tooltip title="Подробнее...">
                                            <Button
                                                shape="circle"
                                                style={{color: "gray"}}
                                                icon={<InfoCircleOutlined />}
                                                type="text" />
                                        </Tooltip>
                                    )}
                        </span>
                    </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "row-reverse"}}>
                    {renderButtons()}
                </div>
            </div>

            <Modal
                open={showDetailsModal}
                title="Информация о подписках..."
                onCancel={() => setShowDetailsModal(false)}
                footer={null}
            >

            </Modal>

        </div>
    );
};


export default ProfileHeader;
