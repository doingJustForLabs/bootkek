import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import EnumsService from 'services/enums.service.js';

function SelectCourse(props) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        EnumsService.getEnumsCourses()
            .then(res => {
                const list = Array.isArray(res.data.enums)
                    ? res.data.enums.map(course => ({
                        value: course,
                        label: course
                    }))
                    : [];
                setOptions(list);
            })
    }, []);

    return (
        <Select
            placeholder="Выберите курс"
            options={options}
            loading={options.length === 0}
            {...props}
        />
    );
}

export default SelectCourse;
