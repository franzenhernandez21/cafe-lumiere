import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcomepage from "./Welcomepage";
import LoginPage from "./Loginpage";
import SignupPage from "./SignUppage";
import UserHomepage from "./userhomepage";
import AdminHomepage from "./adminpage"; 
import AboutUs from "./aboutus";
import AboutUs2 from "./aboutus2";
import Profile from "./profile";
import Contactus from "./contactus";
import Contactus2 from "./Contactus2";
import Cart from "./Cart";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import ProductDetailsPage from "./ProductDetailsPage"; 
import CoffeeCategoryPage from "./CoffeeCategoryPage";
import CakeCategoryPage from "./CakeCategoryPage";
import CupcakeCategoryPage from "./CupcakeCategoryPage";
import PieCategoryPage from "./PieCategoryPage";
import GiftingCategoryPage from "./GiftingCategoryPage";


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
        <Route path="/aboutus" element={<AboutUs />} /> 
        <Route path="/aboutus2" element={<AboutUs2 />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/contactus" element={<Contactus />} /> 
        <Route path="/contactus2" element={<Contactus2 />} />
        <Route path="/Cart" element={<Cart />} /> 
        <Route path="/product/:id" element={<ProductDetailsPage />} /> 
        <Route path="/coffee" element={<CoffeeCategoryPage />} />
        <Route path="/cakes" element={<CakeCategoryPage />} />
        <Route path="/cupcake" element={<CupcakeCategoryPage />} />
        <Route path="/pie" element={<PieCategoryPage />} />
        <Route path="/gifting" element={<GiftingCategoryPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);