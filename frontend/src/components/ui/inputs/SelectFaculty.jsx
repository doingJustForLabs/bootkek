import React from 'react';
import {Select} from "antd";
import {FACULTY_OPTIONS} from "configs/enum.faculty.js";

function SelectFaculty(props) {
    return (
        <Select
            placeholder="Выберите факультет"
            options={FACULTY_OPTIONS}
            {...props}
        />
    );
}

export default SelectFaculty;