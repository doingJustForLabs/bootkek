import React from "react";
import { Avatar, Button } from "antd";
import {
    UserOutlined,
    FormOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import {goTo} from "utils/navigator.js";

const ProfileHeader = ({context = null, profileData, handlerFunc}) => {

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
                    <Button
                        style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                        type={profileData.is_following ? "default" : "primary"}
                        danger={profileData.is_following}
                        onClick={handlerFunc}
                    >
                        {profileData.is_following ? "Отписаться" : "Подписаться"}
                    </Button>
                );
        }
    };

    const renderAvatar = () => {
        const src = profileData.avatar_basename ? `http://127.0.0.1:8000/${profileData.avatar_basename}_256.jpg` : null

        const avatar = (
            <Avatar
                size={150}
                src={src}
                icon={!src && <UserOutlined />}
                style={{ backgroundColor: "#76777c", marginTop: "-50px" }}
            />
        );

        return avatar;
    };

    return (
        <div>
            <div style={{height: "15vh"}}></div>
            <div
                style={{
                    height: "15vh",
                    padding: "0px 50px",
                    borderRadius: "30px 30px 0 0",
                    backgroundColor: "#f4f4f4",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {renderAvatar()}
                <h2 style={{ alignSelf: "center", margin: "0px 20px" }}>
        <span style={{ fontSize: "28px", fontWeight: "bold" }}>
          {profileData?.name || "Имя"}
        </span>
                    <br />
                    <span style={{ color: "gray" }}>
          @{profileData?.username || "username"}
        </span>
                </h2>

                <div style={{ flex: "1", display: "flex", flexDirection: "row-reverse" }}>
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
