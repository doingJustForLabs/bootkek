import React from 'react';
import {Tag} from "antd";

const SkillsList = ({ skills, onClose, style }) => {
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
                <span style={{ color: "#888", fontSize: "24px" }}>Нет навыков</span>
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
                    closable={onClose !== undefined && onClose !== null}
                    onClose={() => onClose(skill)}
                    key={skill}
                    color="blue"
                    style={{
                        borderRadius: '12px',
                        marginBottom: 5,
                        display: 'flex',
                        fontSize: '18px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '20px',
                        padding: '14px',
                    }}
                >
                    {skill}
                </Tag>
            ))}
        </div>
    );
};

export default SkillsList;