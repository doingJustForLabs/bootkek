import { Select, Button, Tag } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import EnumsService from "services/enums.service.js";
import SkillsList from "components/ui/profile/SkillsList.jsx"; // Assuming this path is correct

const SkillSelector = ({ value, onChange }) => {
    const currentSkills = Array.isArray(value) ? value : [];

    const [allSkills, setAllSkills] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        EnumsService.getEnumsSkills()
            .then(response => {
                const skills = response.data.enums || [];
                setAllSkills(skills);
                setFilteredOptions(skills);
            })
            .catch(error => {
                setAllSkills([]);
                setFilteredOptions([]);
            });
    }, []);

    const removeSkill = (removedSkill) => {
        const newValue = currentSkills.filter(skill => skill !== removedSkill);
        onChange?.(newValue.length > 0 ? newValue : []);
    };


    const handleSearch = (val) => {
        setInput(val);
        const filtered = allSkills.filter(s =>
            s.toLowerCase().includes(val.toLowerCase())
        );
        setFilteredOptions(filtered);
    };

    const handleSelect = (selectedSkill) => {
        setInput(selectedSkill);
        if (selectedSkill && !currentSkills.includes(selectedSkill)) {
            onChange?.([...currentSkills, selectedSkill]);
        }
        setInput(' ');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Select
                showSearch
                value={input || undefined}
                onSearch={handleSearch}
                onSelect={handleSelect}
                placeholder="Выберите и добавьте навык"
                style={{ minWidth: 200 }}
                options={Array.isArray(filteredOptions)
                    ? filteredOptions.map(s => ({ value: s, label: s }))
                    : []}
                filterOption={false}
            />
            <SkillsList
                skills={currentSkills}
                onClose={removeSkill}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    padding: '10px',
                    minHeight: '100px',
                    background: 'white',
                    border: '1px solid lightgray',
                    borderRadius: '8px',
                    flex: 1}}
            />
        </div>
    );
};

export default SkillSelector;