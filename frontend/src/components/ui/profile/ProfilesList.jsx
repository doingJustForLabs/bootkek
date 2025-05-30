import React from 'react';
import ProfilePreview from "components/ui/profile/ProfilePreview.jsx";

const ProfilesList = ({ profilesData, style }) => {

    return (
        <div className="w-full max-w-4xl space-y-4">
            {profilesData.length === 0 ? (
                <div className="text-center text-gray-600 text-xl">Профили не найдены</div>
            ) : (
                profilesData.map(profile => (
                    <ProfilePreview key={profile.user_id} profileData={profile} style={style} />

                ))
            )}
        </div>
    );
};


export default ProfilesList;