import { Routes, Route } from "react-router";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Navbar from "../components/layout/Navbar";

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}
