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
import WatchlistPage from "../pages/WatchlistPage";
import PaymentSuccess from "../pages/PaymentSuccess";
import UpdateAuctionPage from "../pages/UpdateAuctionPage";
import UserAuctionsPage from "../pages/UserAuctionsPage";
import UserProfilePage from "../pages/UserProfilePage";
import UserTransactionsPage from "../pages/UserTransactionsPage";
import UserBidsPage from "../pages/UserBidsPage";
import AllAuctionsList from "../pages/AllAuctionsList";
import PendingAuctionsList from "../pages/PendingAuctionList";
import AllUsersList from "../pages/AllUsersList";

export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route element={<Navbar />}>
          <Route path="/dashboard" element={<UserDashboard />}>
            <Route path="transactions" element={<UserTransactionsPage />} />
            <Route path="bids/me" element={<UserBidsPage />} />
            <Route path="auctions/me" element={<UserAuctionsPage />} />

            <Route path="register-buyer" element={<RegisterBuyerPage />} />
            <Route path="register-seller" element={<RegisterSellerPage />} />
            <Route path="admin/manage-auctions" element={<AllAuctionsList />} />
            <Route path="admin/manage-users" element={<AllUsersList />} />
            <Route
              path="admin/pending-auctions"
              element={<PendingAuctionsList />}
            />
          </Route>

          <Route path="/home" element={<Home />} />
          <Route
            path="/auction/category/:category"
            element={<WatchCategoryPage />}
          />
          <Route path="/auction" element={<CreateAuctionPage />} />
          <Route path="/auction/:id" element={<AuctionPage />} />
          <Route path="/auction/:id/update" element={<UpdateAuctionPage />} />

          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/user/:id" element={<UserProfilePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </>
  );
}
