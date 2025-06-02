import React from 'react';
import 'styles/profile/ProfilePreview.css';
import ProfileAvatar from "components/profile/ProfileAvatar.jsx";

const ProfilePreview = ({ profileData = {}, onClick, onAvatarClick, children, avatarSize = 64, disabled = false, style = {} }) => {

    const name = profileData?.name;
    const username = profileData?.username;

    return (
        <div
            className="profile-preview"
            style={{
                cursor: (disabled ? "not-allowed" : (onClick && "pointer")),
                ...style}}
            onClick={onClick}
        >
           <ProfileAvatar profileData={profileData} onClick={onAvatarClick} avatarSize={64}/>

            <div className="info">
                <span className="name">
                    {name}
                </span>
                <span className="username">
                    @{username}
                </span>
            </div>

            {children}

        </div>
    );
}

export default ProfilePreview;
