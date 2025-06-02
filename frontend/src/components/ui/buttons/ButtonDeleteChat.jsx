import React from 'react';
import {Button, message, Popconfirm, Tooltip} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import ChatService from "services/chat.service.js";
import {goTo} from "utils/navigator.js";

const ButtonDeleteChat = ({targetChatId, onRefresh, setLoading, style = {}}) => {

    const deleteChat = async () => {
        setLoading(true);
        try {
            await ChatService.deleteChat(targetChatId);
            message.success('Чат удален!');
            goTo('/chats');
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Ошибка удаления чата:', error);
            message.error('Не удалось удалить чат');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Tooltip title="Удалить чат">
            <Popconfirm
                title="Вы уверены, что хотите удалить этот чат?"
                onConfirm={deleteChat}
                okText="Да"
                cancelText="Нет"
            >
                <Button
                    type="text"
                    shape="circle"
                    icon={<DeleteOutlined />}
                    size="small"
                    style={style}
                />
            </Popconfirm>
        </Tooltip>

    );
};


export default ButtonDeleteChat;