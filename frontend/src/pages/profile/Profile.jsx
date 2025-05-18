import { useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore";
import NavLayout from "../../components/layouts/NavLayout";
import Message from "../../utils/messages.js";
import {Avatar, Button} from "antd";
import {FormOutlined, UserOutlined} from "@ant-design/icons";
import FollowsStore from "store/FollowsStore.js";
import {wrapHandleError} from "utils/errors.js";
import {goTo} from "utils/navigator.js";

const Profile = () => {
    const userId = Number(useParams().userId);
    const [profileData, setProfileData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                await wrapHandleError(async () => {
                    const response = await ProfileStore.getProfileByUserId(userId);
                    setAvatar(response.data.profile.avatar_basename);
                    setProfileData(response.data.profile);
                    setIsCurrentUser(response.data.is_current_user)
                })()
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) setNotFound(true);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleFollow = async () => {
        await wrapHandleError(async () => {
            await FollowsStore.followByUserId(userId);
            setIsFollowing(true);
            Message.success("Вы подписались на пользователя");
        })()
    };

    const handleUnfollow = async () => {
        await wrapHandleError(async () => {
            await FollowsStore.unfollowByUserId(userId);
            setIsFollowing(false);
            Message.success("Вы отписались от пользователя");
        })();
    };

    if (notFound) {
        return (
            <NavLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-gray-600">Такого профиля не существует...</h1>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div className="flex justify-center min-h-screen">
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
                            {isCurrentUser ? (
                                <Button
                                    style={{ margin: "10px", alignSelf: "center", fontSize: "16px" }}
                                    icon={<FormOutlined />}
                                    onClick={() => goTo("/profile/edit")}
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
                    </div>
                </div>
            </div>
        </NavLayout>
    );
};

export default Profile;
