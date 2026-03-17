import { Routes, Route } from "react-router";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Navbar from "../components/layout/Navbar";

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}
