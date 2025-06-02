import React from 'react';
import { Tag } from 'antd';
import Placeholder from 'components/ui/Placeholder.jsx';
import 'styles/profile/SkillsList.css';

const SkillsList = ({ skills = [], limit = 3, onClose, style = {}, skillStyle = {} }) => {
    const skillsToRender = Array.isArray(skills) ? skills : [];

    if (skillsToRender.length === 0) {
        return <Placeholder style={style}>Нет навыков</Placeholder>;
    }

    const visibleSkills = limit ? skillsToRender.slice(0, limit) : skillsToRender;
    const hiddenCount = limit ? skillsToRender.length - limit : 0;

    return (
        <div className="skills-list" style={style}>
            {visibleSkills.map(skill => (
                <Tag
                    closable={typeof onClose === 'function'}
                    onClose={() => onClose?.(skill)}
                    key={skill}
                    color="blue"
                    className="skill"
                    style={{borderRadius: "25px",...skillStyle}}
                >
                    {skill}
                </Tag>
            ))}

            {hiddenCount > 0 && (
                <Tag
                    color="geekblue"
                    className="skill"
                    style={{borderRadius: "25px",...skillStyle}}
                >
                    +{hiddenCount}
                </Tag>
            )}
        </div>
    );
};

export default SkillsList;
