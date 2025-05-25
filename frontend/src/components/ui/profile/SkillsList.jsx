import React from 'react';
import {Tag} from "antd";

const SkillsList = ({ skills, style }) => {
    const skillsToRender = Array.isArray(skills) ? skills : [];

    if (skillsToRender.length === 0){
        return (
            <div className="flex">
                <h1 className="text-2xl text-gray-600">Нет скиллов</h1>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '4px 8px',
            borderRadius: '8px',
            ...style
        }}>
            {skillsToRender.map(skill => (
                <Tag
                    key={skill}
                    color="blue"
                    style={{
                        borderRadius: '12px',
                        marginBottom: 5,
                        display: 'flex',
                        fontSize: '14px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '20px',
                        padding: '0 12px',
                    }}
                >
                    {skill}
                </Tag>
            ))}
        </div>
    );
};

export default SkillsList;