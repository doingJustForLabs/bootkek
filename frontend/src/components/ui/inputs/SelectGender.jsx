import {Select} from "antd";
import React from 'react';
import {GENDER_OPTIONS} from "configs/enum.genders.js";

function SelectGender(props) {
    return (
        <Select
            options={GENDER_OPTIONS}
            placeholder="Выберите пол"
            {...props}
        />
    );
}

export default SelectGender;