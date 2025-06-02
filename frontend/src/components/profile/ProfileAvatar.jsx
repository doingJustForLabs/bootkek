import React from 'react';
import {UserOutlined} from "@ant-design/icons";
import {Avatar, Tooltip} from "antd";
import {goToProfile} from "utils/navigator.js";
import {API_URL} from "services/api.js";


const ProfileAvatar = ({profileData = {}, onClick = () => goToProfile(profileData.user_id), avatarSize= 64, showTip = false, style = {}, srcFile = null}) => {

    const avatarBasename = profileData?.avatar_basename;
    const username = profileData?.username;

    const imgSource = srcFile ? URL.createObjectURL(srcFile) : (profileData.avatar_basename ? `${API_URL}/${profileData.avatar_basename}_256.jpg` : null);

    return (
        <Tooltip title={showTip && username}>
            <Avatar
                size={avatarSize}
                className="avatar"
                src={imgSource}
                onClick={onClick}
                icon={!avatarBasename && <UserOutlined />}
                style={{ cursor: (onClick && "pointer"), backgroundColor: '#9fa8d3', border: "solid 2px #9fa8d3", ...style}}
            />
        </Tooltip>
    );
};

export default ProfileAvatar;