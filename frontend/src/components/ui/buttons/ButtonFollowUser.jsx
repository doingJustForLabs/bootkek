import React from 'react';
import {Button, Tooltip} from "antd";
import {UserAddOutlined} from "@ant-design/icons";
import {wrapHandleError} from "utils/errors.js";
import FollowsStore from "store/FollowsStore.js";
import Message from "utils/messages.js";

const ButtonFollowUser = ({targetUserId, onRefresh, showTip, shape, text, style}) => {

    const handleFollow = async () => {
        await wrapHandleError(async () => {
            await FollowsStore.followByUserId(targetUserId);
            if (onRefresh) onRefresh();
            Message.success("Вы подписались на пользователя");
        })();
    };

    return (
        <Tooltip title={showTip ? "Подписаться" : null}>
            <Button
                shape={shape ? shape : "round"}
                size="large"
                style={{ margin: "5px", alignSelf: "center", fontSize: "20px", ...style }}
                icon={<UserAddOutlined />}
                type={"primary"}
                onClick={handleFollow}
            >
                {text}
            </Button>
        </Tooltip>
    );
};


export default ButtonFollowUser;