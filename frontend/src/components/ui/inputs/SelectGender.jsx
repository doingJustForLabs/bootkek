import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import EnumsService from 'services/enums.service';

function SelectGender(props) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        EnumsService.getEnumsSex()
            .then(res => {
                const opts = Array.isArray(res.data.enums)
                    ? res.data.enums.map(g => ({ label: g, value: g }))
                    : [];
                setOptions(opts);
            })
    }, []);

    return (
        <Select
            options={options}
            placeholder="Выберите пол"
            loading={options.length === 0}
            {...props}
        />
    );
}

export default SelectGender;
