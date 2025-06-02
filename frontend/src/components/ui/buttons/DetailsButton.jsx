import React from 'react';
import {Button, Tooltip} from "antd";
import {InfoCircleOutlined} from "@ant-design/icons";


const DetailsButton = ({onClick, style}) => {
    return (
        <Tooltip title="Подробнее...">
            <Button
                shape="circle"
                style={style}
                onClick={onClick}
                icon={<InfoCircleOutlined/>}
                type="text" />
        </Tooltip>
    );
};


export default DetailsButton;