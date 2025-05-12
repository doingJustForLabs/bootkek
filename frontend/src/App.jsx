import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login";
import Registration from "./components/pages/REgistration";
import ResetPwd from "./components/pages/ResetPwd";
import Profile from "./components/pages/Profile";
import ProfileStepOne from "./components/pages/ProfileStepOne.jsx";
import ProfileStepTwo from "./components/pages/ProfileStepTwo.jsx";
import ProfileCreation from "./components/pages/ProfileCreation.jsx";
import ProfileEditing from "./components/pages/ProfileEditing.jsx";

function App() {

  return (
    <>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/reset" element={<ResetPwd />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/create" element={<ProfileCreation />} />
              <Route path={"/profile/edit"} element={<ProfileEditing />} />
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
