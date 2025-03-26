import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './http/AuthContext.jsx';
import Login from "./components/pages/Login";
import Registration from "./components/pages/REgistration";
import ResetPwd from "./components/pages/ResetPwd";
import Profile from "./components/pages/Profile";

function App() {
  
  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/reset" element={<ResetPwd />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
