import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

function ProfilePreview({ profileData, style }) {
    const navigate = useNavigate();
    const avatar = profileData?.avatar_basename;

    const handleClick = () => {
        if (profileData?.user_id) {
            navigate(`/profile/${profileData.user_id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                cursor: 'pointer',
                height: '100px',
                padding: '10px',
                borderRadius: '25px',
                backgroundColor: '#f4f4f4',
                display: 'flex',
                alignItems: 'center',
                ...style
            }}
        >
            <Avatar
                size={64}
                src={avatar ? `http://127.0.0.1:8000/${avatar}_128.jpg` : undefined}
                icon={!avatar && <UserOutlined />}
                style={{ backgroundColor: '#76777c' }}
            />
            <h2 style={{ alignSelf: 'center', margin: '0px 20px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {profileData?.name}
                </span>
                <br />
                <span style={{ color: 'gray' }}>
                    @{profileData?.username}
                </span>
            </h2>
        </div>
    );
}

export default ProfilePreview;
