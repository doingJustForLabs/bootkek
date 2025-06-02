import React from 'react';
import 'styles/profile/ProfilePreview.css';
import ProfileAvatar from "components/ui/profile/ProfileAvatar.jsx";

const ProfilePreview = ({ profileData = {}, onClick, children, avatarSize = 64, style = {} }) => {

    const name = profileData?.name;
    const username = profileData?.username;

    return (
        <div
            className="profile-preview"
            onClick={onClick}
            style={{...style}}
        >
           <ProfileAvatar profileData={profileData} avatarSize={64}/>

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
