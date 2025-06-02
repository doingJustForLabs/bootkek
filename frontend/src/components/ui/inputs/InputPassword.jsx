import React from 'react';
import {LockOutlined} from "@ant-design/icons";
import {Input} from "antd";
import {MAX_PASSWORD_LENGTH} from "configs/constants.js";

function InputPassword(props) {
    return (
        <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder="Введите пароль"
            maxLength={MAX_PASSWORD_LENGTH}
            {...props}
        />
    );
}

export default InputPassword;