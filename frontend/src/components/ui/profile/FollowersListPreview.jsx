import React from "react";
import { Avatar, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const FollowersListPreview = ({ followers, style }) => {
    const navigate = useNavigate();

    if (!followers || !Array.isArray(followers) || followers.length === 0) {
        return (
            <div style={{ ...style, padding: "10px", textAlign: "center" }}>
                <span style={{ color: "#888" }}>Нет подписчиков</span>
            </div>
        );
    }

    const shuffled = [...followers].sort(() => 0.5 - Math.random());
    const limitedFollowers = shuffled.slice(0, 6);

    return (
        <div
            style={{
                display: "flex",
                gap: "12px",
                padding: "8px",
                borderRadius: "12px",
                backgroundColor: "#f9f9f9",
                ...style,
            }}
        >
            {limitedFollowers.map((profile) => (
                <Tooltip key={profile.user_id} title={profile.username}>
                    <Avatar
                        size={48}
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
