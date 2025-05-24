import React from "react";
import {useNavigate, useNavigation} from "react-router-dom";
import ChatComponent from "./ChatComponent";
import {Button} from "antd";
import { observer } from 'mobx-react-lite';
import AuthStore from 'store/AuthStore.js';


const ChatPage = observer(() => {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h1 className="text-xl font-bold">Чат</h1>
                <Button onClick={() => navigate(`/profile/${AuthStore.currentId}`)}>Вернуться в профиль</Button>
            </div>
            <div className="flex-1">
                <ChatComponent />
            </div>
        </div>
    )
});

// const ChatPage = () => {
//     const navigate = useNavigate();

//     return (
//         <div className="h-screen flex flex-col">
//             <div className="p-4 border-b flex justify-between items-center">
//                 <h1 className="text-xl font-bold">Чат</h1>
//                 <Button onClick={() => navigate("/profile")}>Вернуться в профиль</Button>
//             </div>
//             <div className="flex-1">
//                 <ChatComponent />
//             </div>
//         </div>
//     )
// };

export default ChatPage;