import { useState } from "react";
import { Avatar, Button, message } from "antd";
import { UserOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import FollowsStore from "../../store/FollowsStore";

const ProfileLayout = ({ contextHolder, avatar, profileData, isMe, userId }) => {
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(false);
    const [messageApi] = message.useMessage();

    const handleFollow = async () => {
        try {
            await FollowsStore.followByUserId(userId);
            setIsFollowing(true);
            messageApi.success("Вы подписались на пользователя");
        } catch (error) {

            const status = error.response?.status;

            messageApi.open({
                type: "error",
                content: error?.response?.data?.detail || "Ошибка подписки.",
            });

            if (status === 401) navigate("/");
        }
    };

    const handleUnfollow = async () => {
        try {
            await FollowsStore.unfollowByUserId(userId);
            setIsFollowing(false);
            messageApi.success("Вы отписались от пользователя");
        } catch (error) {
            messageApi.open({
                type: "error",
                content: error?.response?.data?.detail || "Ошибка отписки.",
            });
        }
    };

    return (
        <div className="flex justify-center min-h-screen">
            {contextHolder}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#3b488c",
                }}
            >
                <div style={{ height: "25vh" }} />

                <div
                    style={{
                        height: "100px",
                        padding: "0px 50px",
                        borderRadius: "30px 30px 0 0",
                        backgroundColor: "#f4f4f4",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Avatar
                        size={150}
                        src={avatar ? `http://127.0.0.1:8000/${avatar}_256.jpg` : undefined}
                        icon={!avatar && <UserOutlined />}
                        style={{ backgroundColor: "#76777c", marginTop: "-50px" }}
                    />
                    <h2 style={{ alignSelf: "center", margin: "0px 20px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                            {profileData?.name}
                        </span>
                        <br />
                        <span style={{ color: "gray" }}>@{profileData?.username}</span>
                    </h2>

                    <div style={{ flex: "1", display: "flex", flexDirection: "row-reverse" }}>
                        {isMe ? (
                            <Button
                                style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                                icon={<FormOutlined />}
                                onClick={() => navigate("/profile/edit")}
                            >
                                Редактировать
                            </Button>
                        ) : isFollowing ? (
                            <Button
                                style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                                danger
                                onClick={handleUnfollow}
                            >
                                Отписаться
                            </Button>
                        ) : (
                            <Button
                                style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                                type="primary"
                                onClick={handleFollow}
                            >
                                Подписаться
                            </Button>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        padding: "25px 50px",
                        backgroundColor: "#f4f4f4",
                        height: "100%",
                    }}
                >
                    Всякая инфа
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
