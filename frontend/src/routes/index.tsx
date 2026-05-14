import { Routes, Route } from "react-router";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Navbar from "../components/layout/Navbar";
import RegisterPage from "../pages/RegisterPage";
import UserDashboard from "../pages/UserDashboard";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import WatchCategoryPage from "../pages/WatchCategoryPage";
import AuctionPage from "../pages/AuctionPage";
import CreateAuctionPage from "../pages/CreateAuctionPage";
import RegisterBuyerPage from "../pages/RegisterBuyerPage";
import RegisterSellerPage from "../pages/RegisterSellerPage";

export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route element={<Navbar />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/auction/category/:category"
            element={<WatchCategoryPage />}
          />
          <Route path="/auction" element={<CreateAuctionPage />} />
          <Route path="/auction/:id" element={<AuctionPage />} />

          <Route
            path="/dashboard/register-buyer"
            element={<RegisterBuyerPage />}
          />
          <Route
            path="/dashboard/register-seller"
            element={<RegisterSellerPage />}
          />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </>
  );
}
