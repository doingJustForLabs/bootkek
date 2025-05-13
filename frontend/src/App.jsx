import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Registration from "./pages/auth/Registration.jsx";
import Profile from "./pages/profile/Profile.jsx";
import ProfileCreation from "./pages/profile/ProfileCreation.jsx";
import ProfileEditing from "./pages/profile/ProfileEditing.jsx";

function App() {

  return (
    <>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/profile/create" element={<ProfileCreation />} />
              <Route path="/profile/edit" element={<ProfileEditing />} />
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
