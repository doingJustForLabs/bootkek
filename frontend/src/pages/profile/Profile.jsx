import { useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore";
import NavLayout from "../../components/layouts/NavLayout";
import Message from "../../utils/messages.js";
import FollowsStore from "store/FollowsStore.js";
import {wrapHandleError} from "utils/errors.js";
import {goTo} from "utils/navigator.js";
import ProfileHeader from "components/ui/profile/ProfileHeader.jsx";
import ProfileContent from "components/ui/profile/ProfileContent.jsx"; // Убедитесь, что SkillsList работает корректно
import { Button } from "antd";
import ChatService from "../../services/chat.service";
import AuthStore from "store/AuthStore";
import { CommentOutlined } from "@ant-design/icons";
import { findOrCreateDirectChat } from "../../utils/chatUtils.js";

const Profile = () => {
    const userId = Number(useParams().userId);
    const navigate = useNavigate();
    const { currentId } = AuthStore;
    const [profileData, setProfileData] = useState(null);
    const [followersData, setFollowersData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                await wrapHandleError(async () => {
                    if (userId) {
                        const responseProfile = await ProfileStore.getProfileByUserId(userId);
                        setProfileData({...responseProfile.data.profile,
                            is_current_user: responseProfile.data.is_current_user,
                            is_following: responseProfile.data.is_following});

                        const responseFollowers = await FollowsStore.getFollowersByUserId(userId, 100, 1);
                        setFollowersData(responseFollowers.data);
                    } else {
                        goTo('/');
                    }
                })()
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) setNotFound(true);
            }
        };
        fetchProfile();
        if (currentId) {
            ChatService.getChatsWithProfiles(currentId)
                .then(response => setChats(response.data || []))
                .catch(error => console.error('Ошибка загрузки чатов:', error));
        }
    }, [userId, currentId]);

    const handleFollow = async () => {
        await wrapHandleError(async () => {
            if (profileData.is_following) {
                await FollowsStore.unfollowByUserId(userId);
                setProfileData({...profileData, is_following: false});
                Message.success("Вы отписались от пользователя");
            } else {
                await FollowsStore.followByUserId(userId);
                setProfileData({...profileData, is_following: true});
                Message.success("Вы подписались на пользователя");
            }
        })()
    };


const handleCreateDirectChat = async () => {
        if (!profileData || profileData.is_current_user || creatingChat) return;
        setCreatingChat(true);
        await findOrCreateDirectChat(
            userId,
            currentId,
            chats,
            ChatService.createChat,
            navigate,
            Message // Передаем Message для отображения уведомлений
        );
        setCreatingChat(false);
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

    if (!(profileData && followersData)) {
        return (
            <NavLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-gray-600">Загрузка профиля...</h1>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div
                style={{
                    width: "80%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#3b488c",
                    margin: '0 auto',
                }}
            >
                <ProfileHeader
                    context={profileData.is_current_user ? "ME" : null}
                    profileData={profileData}
                    handlerFunc={profileData.is_current_user ? null : handleFollow}
                    extraActions={!profileData.is_current_user && (
                        <Button
                            onClick={handleCreateDirectChat}
                            loading={creatingChat}
                            icon={<CommentOutlined />}
                        >
                        </Button>
                    )}
                />

                <ProfileContent
                    profileData={profileData}
                    followersData={followersData} />

            </div>
        </NavLayout>
    );
};

export default Profile;