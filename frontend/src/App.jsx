import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import { AuthProvider } from './http/AuthContext.jsx';
import Login from "./components/pages/Login";
import Registration from "./components/pages/REgistration";
import ResetPwd from "./components/pages/ResetPwd";
import Profile from "./components/pages/Profile";
=======
import { AuthProvider } from './pages/AuthContext.jsx';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPwd from "./pages/ResetPwd";
import Profile from "./pages/Profile";
>>>>>>> dev

function App() {
  
  return (
    <>
      <BrowserRouter>
<<<<<<< HEAD
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/reset" element={<ResetPwd />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
=======
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset" element={<ResetPwd />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </AuthProvider>
>>>>>>> dev
      </BrowserRouter>
    </>
  )
}

export default App
