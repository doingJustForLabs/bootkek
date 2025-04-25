import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login";
import Registration from "./components/pages/REgistration";
import ResetPwd from "./components/pages/ResetPwd";
import Profile from "./components/pages/Profile";
import ProfileStepOne from "./components/pages/ProfileStepOne.jsx";
import ProfileStepTwo from "./components/pages/ProfileStepTwo.jsx";

function App() {

  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/reset" element={<ResetPwd />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/newprofile/1" element={<ProfileStepOne />} />
            <Route path="/newprofile/2" element={<ProfileStepTwo />} />
            <Route path="/newprofile/3" element={<ProfileStepOne />} />
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
