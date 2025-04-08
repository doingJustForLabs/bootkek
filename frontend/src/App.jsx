import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './pages/AuthContext.jsx';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPwd from "./pages/ResetPwd";
import Profile from "./pages/Profile";
import ChatPage from "./pages/ChatPage";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;
  return user ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset" element={<ResetPwd />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<ChatPage  />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App
