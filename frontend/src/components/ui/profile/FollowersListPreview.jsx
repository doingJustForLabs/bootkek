import React from 'react';
import {Avatar} from "antd";
import {UserOutlined} from "@ant-design/icons";

const SkillsList = ({ followers, style }) => {
    const skillsToRender = Array.isArray(skills) ? skills : [];

    const handleClick = () => {
        if (profileData?.user_id) {
            navigate(`/profile/${profileData.user_id}`);
        }
    };

    if (skillsToRender.length === 0){
        return (
            <div className="flex">
                <h1 className="text-2xl text-gray-600">Нет скиллов</h1>
            </div>
        );
    }

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
            }}
        >
            <Avatar
                size={64}
                src={avatar ? `http://127.0.0.1:8000/${avatar}_128.jpg` : undefined}
                icon={!avatar && <UserOutlined />}
                style={{ backgroundColor: '#76777c' }}
            />
        </div>
    );
};

export default SkillsList;