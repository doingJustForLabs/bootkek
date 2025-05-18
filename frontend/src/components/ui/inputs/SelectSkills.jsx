import { Select, Button, Tag } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';
import {SKILLS_OPTIONS} from "configs/enum.skills.js";

const SkillSelector = () => {
    const allSkills = SKILLS_OPTIONS;
    const [skills, setSkills] = useState([]);
    const [input, setInput] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(allSkills);

    const addSkill = () => {
        const skill = input.trim();
        if (skill && !skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
        setInput('');
    };

    const removeSkill = (removedSkill) => {
        setSkills(skills.filter(skill => skill !== removedSkill));
    };

    const handleSearch = (value) => {
        setInput(value);
        const filtered = allSkills.filter(s =>
            s.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
    };

    const handleSelect = (value) => {
        setInput(value);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12}}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    minHeight: '40px',
                    padding: '4px 8px',
                    background: 'white',
                    border: '1px solid',
                    borderColor: 'lightgray',
                    borderRadius: '8px',
                    flex: 1,
                }}>
                    {skills.map(skill => (
                        <Tag
                            key={skill}
                            color="blue"
                            closable
                            onClose={() => removeSkill(skill)}
                            closeIcon={<CloseOutlined />}
                            style={{
                                borderRadius: '12px',
                                marginBottom: 5,
                                display: 'flex',
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
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <Select
                    showSearch
                    value={input || undefined}
                    onSearch={handleSearch}
                    onSelect={handleSelect}
                    onChange={setInput}
                    placeholder="Выберите и добавьте навык"
                    style={{ minWidth: 200 }}
                    options={filteredOptions.map(s => ({ value: s, label: s }))}
                    filterOption={false}
                />
                <Button icon={<PlusOutlined />} onClick={addSkill} />
            </div>
        </div>
    );
};

export default SkillSelector;
