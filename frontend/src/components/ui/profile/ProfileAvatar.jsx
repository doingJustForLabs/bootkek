import React from 'react';
import {UserOutlined} from "@ant-design/icons";
import {Avatar, Tooltip} from "antd";
import {goToProfile} from "utils/navigator.js";


const ProfileAvatar = ({profileData = {}, linked = false, avatarSize= 64, showTip = false, style = {}, srcFile = null}) => {

    const avatarBasename = profileData?.avatar_basename;
    const username = profileData?.username;

    const imgSource = srcFile ? URL.createObjectURL(srcFile) : (profileData.avatar_basename ? `http://127.0.0.1:8000/${profileData.avatar_basename}_256.jpg` : null);

    return (
        <Tooltip title={showTip && username}>
            <Avatar
                size={avatarSize}
                className="avatar"
                src={imgSource}
                onClick={linked ? () => goToProfile(profileData.user_id) : null}
                icon={!avatarBasename && <UserOutlined />}
                style={{ backgroundColor: '#9fa8d3', border: "solid 2px #9fa8d3", ...style}}
            />
        </Tooltip>
    );
};

export default ProfileAvatar;