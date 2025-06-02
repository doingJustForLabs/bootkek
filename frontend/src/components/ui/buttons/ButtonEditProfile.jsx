import React from 'react';
import {Button, Tooltip} from "antd";
import {FormOutlined} from "@ant-design/icons";
import {goTo} from "utils/navigator.js";


const ButtonEditProfile = ({showTip = false, shape, text, style}) => {
    return (
        <Tooltip title={showTip ? "Редактировать" : null}>
            <Button
                shape={shape ? shape : "round"}
                size="large"
                style={{ margin: "5px", alignSelf: "center", fontSize: "20px", ...style }}
                icon={<FormOutlined />}
                onClick={() => goTo("/profile/edit")}
            >
                {text}
            </Button>
        </Tooltip>
    );
};


export default ButtonEditProfile;