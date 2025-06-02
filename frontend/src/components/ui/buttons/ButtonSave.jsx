import React from 'react';
import {SaveOutlined} from "@ant-design/icons";
import {Button, Tooltip} from "antd";

const ButtonSave = ({onClick, showTip, shape, text, style}) => {
    return (
        <Tooltip title={showTip ? "Сохранить" : null}>
            <Button
                size="large"
                shape={shape ? shape : "round"}
                style={{ margin: '5px', alignSelf: 'center', fontSize: "20px", ...style }}
                icon={<SaveOutlined />}
                onClick={onClick}
                type="primary"
            >
                {text}
            </Button>
        </Tooltip>
    );
};


export default ButtonSave;