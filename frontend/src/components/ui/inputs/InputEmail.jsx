import React from 'react';
import {MailOutlined} from "@ant-design/icons";
import {Input} from "antd";

function InputEmail(props) {
    return (
        <Input
            prefix={<MailOutlined />}
            placeholder="Введите почту"
            size="large"
            {...props}
        />
    );
}

export default InputEmail;