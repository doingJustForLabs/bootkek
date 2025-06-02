import React from 'react';
import {Input} from "antd";
import {MAX_USERNAME_LENGTH} from "configs/constants.js";

function InputUsername(props) {
    return (
        <Input
            placeholder="Введите никнейм"
            prefix="@"
            maxLength={MAX_USERNAME_LENGTH}
            size="large"
            {...props}
        />
    );
}

export default InputUsername;