import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import EnumsService from 'services/enums.service.js';

function SelectFaculty(props) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        EnumsService.getEnumsFaculties()
            .then(res => {
                const list = Array.isArray(res.data.enums)
                    ? res.data.enums.map(faculty => ({
                        value: faculty,
                        label: faculty
                    }))
                    : [];
                setOptions(list);
            })
    }, []);

    return (
        <Select
            placeholder="Выберите факультет"
            options={options}
            loading={options.length === 0}
            allowClear
            {...props}
        />
    );
}

export default SelectFaculty;
