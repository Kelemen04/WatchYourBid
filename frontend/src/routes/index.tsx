import { Routes, Route } from "react-router";
import Home from "../pages/Home";
import Navbar from "../components/layout/Navbar";
import UserDashboard from "../pages/UserDashboard";
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
import FilteredAuctionsList from "../pages/FilteredAuctionsList";
import AuthLayout from "../pages/AuthLayout";
import LoginForm from "../features/auth/LoginForm";
import RegisterForm from "../features/auth/RegisterForm";
import EmailForm from "../features/auth/EmailForm";
import ResetPassword from "../features/auth/ResetPasswordForm";
import AllTransactionsList from "../pages/AllTransactionsList";
import UpdateBuyerPage from "../pages/UpdateBuyerPage";
import UpdateSellerPage from "../pages/UpdateSellerPage";

export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route element={<Navbar />}>
          <Route path="/dashboard" element={<UserDashboard />}>
            <Route index element={<UserAuctionsPage />} />

            <Route path="transactions" element={<UserTransactionsPage />} />
            <Route path="bids/me" element={<UserBidsPage />} />
            <Route path="auctions/me" element={<UserAuctionsPage />} />

            <Route path="admin/manage-auctions" element={<AllAuctionsList />} />
            <Route path="admin/manage-users" element={<AllUsersList />} />
            <Route
              path="admin/pending-auctions"
              element={<PendingAuctionsList />}
            />
            <Route
              path="admin/manage-transactions"
              element={<AllTransactionsList />}
            />
          </Route>

          <Route path="/home" element={<Home />} />
          <Route path="/auctions" element={<FilteredAuctionsList />} />
          <Route
            path="/auction/category/:category"
            element={<WatchCategoryPage />}
          />
          <Route path="register-buyer" element={<RegisterBuyerPage />} />
          <Route path="register-seller" element={<RegisterSellerPage />} />
          <Route path="update-buyer" element={<UpdateBuyerPage />} />
          <Route path="update-seller" element={<UpdateSellerPage />} />
          <Route path="/auction" element={<CreateAuctionPage />} />
          <Route path="/auction/:id" element={<AuctionPage />} />
          <Route path="/auction/:id/update" element={<UpdateAuctionPage />} />

          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/user/:id" element={<UserProfilePage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<EmailForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </>
  );
}
