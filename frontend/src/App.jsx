import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import { message } from "antd";
import Message from "./utils/messages.js";

import Login from "./pages/auth/Login.jsx";
import Registration from "./pages/auth/Registration.jsx";
import Profile from "./pages/profile/Profile.jsx";
import ProfileCreation from "./pages/profile/ProfileCreation.jsx";
import ProfileEditing from "./pages/profile/ProfileEditing.jsx";
import Profiles from "./pages/profile/Profiles.jsx";
import ChatPage from "./pages/chats/ChatPage";
import {setNavigator} from "./utils/navigator.js";
import AuthStore from "./store/AuthStore";
import React from "react";

function App() {
    const [messageApi, contextHolder] = message.useMessage();
    Message.setApi(messageApi);

    return (
        <>
            {contextHolder}
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </>
    );
}

function AppContent() {
    const navigate = useNavigate();
    setNavigator(navigate);

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile/create" element={<ProfileCreation />} />
            <Route path="/profile/edit" element={<ProfileEditing />} />
            <Route path="/search/profiles" element={<Profiles />} />
            <Route path="/chats" element={<ChatPage  />} />
        </Routes>
    );
}

export default App;