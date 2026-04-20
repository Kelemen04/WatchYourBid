import { Routes, Route } from "react-router";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Navbar from "../components/layout/Navbar";
import RegisterPage from "../pages/RegisterPage";
import UserDashboard from "../pages/UserDashboard";

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </>
  );
}
