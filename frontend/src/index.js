import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcomepage from "./Welcomepage";
import LoginPage from "./Loginpage";
import SignupPage from "./SignUppage";
import UserHomepage from "./userhomepage";
import AdminHomepage from "./adminpage";
import Blogs from "./blogs"; 
import AboutUs from "./aboutus";
import Profile from "./profile";
import Contactus from "./contactus";
import Cart from "./Cart";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";




const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcomepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/userhomepage" element={<UserHomepage />} />
        <Route path="/adminpage" element={<AdminHomepage />} /> 
        <Route path="/guest" element={<UserHomepage />} />  
        <Route path="/blogs" element={<Blogs />} /> 
        <Route path="/aboutus" element={<AboutUs />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/contactus" element={<Contactus />} /> 
        <Route path="/Cart" element={<Cart />} /> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
