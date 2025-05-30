import React from "react";
import { Avatar, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const FollowersListPreview = ({ followers, style }) => {
    const navigate = useNavigate();

    if (!followers || !Array.isArray(followers) || followers.length === 0) {
        return (
            <div style={{
                ...style,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
                height: "100%",
                textAlign: "center"
            }}>
                <span style={{ color: "#888", fontSize: "24px" }}>Нет подписчиков</span>
            </div>

        );
    }


    const shuffled = [...followers].sort(() => 0.5 - Math.random());
    const limitedFollowers = shuffled.slice(0, 10);

    return (
        <div
            style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                padding: "12px",
                height: "100%",
                width: "100%",
                ...style,
            }}
        >
            {limitedFollowers.map((profile) => (
                <Tooltip key={profile.user_id} title={profile.username}>
                    <Avatar
                        size={64}
                        src={
                            profile.avatar_basename
                                ? `http://127.0.0.1:8000/${profile.avatar_basename}_128.jpg`
                                : undefined
                        }
                        icon={!profile.avatar_basename && <UserOutlined />}
                        style={{
                            cursor: "pointer",
                            backgroundColor: "#ccc",
                        }}
                        onClick={() => navigate(`/profile/${profile.user_id}`)}
                    />
                </Tooltip>
            ))}
        </div>
    );
};

export default FollowersListPreview;
