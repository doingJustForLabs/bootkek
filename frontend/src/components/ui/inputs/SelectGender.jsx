import React from 'react';
import { Select } from 'antd';

function SelectGender(props) {

    return (
        <Select
            options={[{label: "Мужской", value: "male"}, {label: "Женский", value: "female"}]}
            placeholder="Выберите пол"
            allowClear
            size="large"
            {...props}
        />
    );
}

export default SelectGender;
