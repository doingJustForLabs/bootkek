import React from 'react';
import {Select} from "antd";
import {COURSE_OPTIONS} from "configs/enum.courses.js";

function SelectCourse(props) {
    return (
        <Select
            placeholder="Выберите курс"
            options={COURSE_OPTIONS}
            {...props}
        />
    );
}

export default SelectCourse;