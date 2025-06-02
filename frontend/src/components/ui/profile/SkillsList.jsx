import React from 'react';
import {Tag} from "antd";

const SkillsList = ({ skills, style }) => {
    const skillsToRender = Array.isArray(skills) ? skills : [];

    if (skillsToRender.length === 0){
        return (
            <div style={{
                ...style,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
                height: "100%",
                textAlign: "center"
            }}>
                <span style={{ color: "#888", fontSize: "18px" }}>Нет навыков</span>
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