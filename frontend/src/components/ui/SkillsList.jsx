import React from 'react';
import {Tag} from "antd";

const SkillsList = ({ skills, style }) => {
    const skillsToRender = Array.isArray(skills) ? skills : [];

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            minHeight: '40px',
            padding: '4px 8px',
            backgroundColor: 'white',
            borderRadius: '8px',
            flex: 1,
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