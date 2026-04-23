import { Routes, Route } from "react-router";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Navbar from "../components/layout/Navbar";
import RegisterPage from "../pages/RegisterPage";
import UserDashboard from "../pages/UserDashboard";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPasswordPage from "../pages/ResetPasswordPage";

export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route element={<Navbar />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/home" element={<Home />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </>
  );
}
