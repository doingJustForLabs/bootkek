import React from 'react';
import {Button, Tooltip} from "antd";
import {UserDeleteOutlined} from "@ant-design/icons";
import {wrapHandleError} from "utils/errors.js";
import FollowsStore from "store/FollowsStore.js";
import Message from "utils/messages.js";

const ButtonFollowUser = ({targetUserId, onRefresh, showTip, shape, text, style}) => {

    const handleUnfollow = async () => {
        await wrapHandleError(async () => {
            await FollowsStore.unfollowByUserId(targetUserId);
            if (onRefresh) onRefresh();
            Message.success("Вы отписались от пользователя");
        })();
    };

    return (
        <Tooltip title={showTip ? "Отписаться" : null}>
            <Button
                shape={shape ? shape : "round"}
                size="large"
                style={{ margin: "5px", alignSelf: "center", fontSize: "20px", ...style }}
                icon={<UserDeleteOutlined/>}
                danger={true}
                onClick={handleUnfollow}
            >
                {text}
            </Button>
        </Tooltip>
    );
};


export default ButtonFollowUser;