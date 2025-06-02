import React from 'react';
import ProfilePreview from "components/ui/profile/ProfilePreview.jsx";
import Placeholder from "components/ui/Placeholder.jsx";
import "styles/profile/ProfilesList.css";

const ProfilesList = ({
                          profilesData = [],
                          renderItem = (profile) => (<ProfilePreview key={profile.user_id} profileData={profile} avatarSize={64} style={style}/>),
                          style = {}}
) => {
    return (
        <div className="profiles-list" style={style}>
            {profilesData.length === 0 ? (
                <Placeholder>Профили не найдены</Placeholder>
            ) : (
                profilesData.map(profile => renderItem(profile))
            )}
        </div>
    );
};

export default ProfilesList;
