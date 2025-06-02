import React from 'react';
import {CommentOutlined} from "@ant-design/icons";
import {Button, Tooltip} from "antd";
import {findOrCreateDirectChat} from "utils/findOrCreateChat.js";

const ButtonPersonalChat = ({targetUserId, showTip, shape, text, style = {}}) => {
    return (
        <Tooltip title={showTip ? "Открыть чат" : null}>
            <Button
                size="large"
                shape={shape ? shape : "round"}
                style={{ margin: '5px', alignSelf: 'center', fontSize: "20px", ...style }}
                icon={<CommentOutlined />}
                onClick={() => findOrCreateDirectChat(targetUserId)}
                type="primary"
            >
                {text}
            </Button>
        </Tooltip>
    );
};

export default ButtonPersonalChat;
