import React from 'react';
import {UserOutlined} from "@ant-design/icons";
import {Input} from "antd";
import {MAX_NAME_LENGTH} from "configs/constants.js";

function InputName(props) {
    return (
        <Input
            placeholder="Введите имя"
            prefix={<UserOutlined />}
            maxLength={MAX_NAME_LENGTH}
            {...props}
        />
    );
}

export default InputName;