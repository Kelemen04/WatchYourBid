import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDeleteMe } from "../hooks/useUser";
import TransactionForm from "../features/auth/TransactionForm";
import WithdrawForm from "../features/auth/WithdrawForm";
import { getUserId, getUserRole } from "../api/axios";
import { useNavbar } from "../hooks/useNavbar";

export default function UserDashboard() {
  const { mutate, isPending } = useDeleteMe();
  const { data: userData } = useNavbar();
  const navigate = useNavigate();
  const myId = getUserId();
  const myRole = getUserRole();

  const isSuperAdmin = myRole === "SUPER_ADMIN";
  const isAdmin = myRole === "ADMIN" || isSuperAdmin;
  const isMod = myRole === "MODERATOR";

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This process is irreversible!",
    );

    if (confirmDelete) {
      mutate(undefined, {
        onSuccess: () => {
          navigate("/home");
        },
      });
    }
  };

  return (
    <div className="flex gap-5 p-10 bg-text-muted/10">
      <div className="w-[280px] shrink-0 bg-white p-8 border border-border rounded-2xl h-fit">
        <h3 className="font-playfair text-[26px] font-bold text-background mb-6 border-b border-border">
          Dashboard
        </h3>

        {/* Balance */}
        <div className="">
          <p className="text-[10px] uppercase tracking-[0.2em] text-background mb-1">
            Available Balance
          </p>
          <p className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--color-primary)] mb-6">
            €{userData?.balance?.toLocaleString() || 0}
          </p>

          {/* Transactions */}
          <div className="flex flex-col gap-2">
            <TransactionForm />
            <div className="border-b-1 border-text-muted/30"></div>
            <WithdrawForm />
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col gap-4 text-sm font-medium text-text">
          {(isAdmin || isMod) && (
            <div className="border-t border-border pt-4 mt-2">
              <h4 className="text-[18px] font-bold text-background uppercase tracking-widest mb-3">
                {isAdmin ? "ADMIN" : "MODERATOR"}
              </h4>
              <div className="flex flex-col gap-4 text-text-muted text-[16px]">
                <Link
                  to="/dashboard/admin/manage-users"
                  className="hover:text-primary transition-colors"
                >
                  Manage Users
                </Link>
                <Link
                  to="/dashboard/admin/manage-auctions"
                  className="hover:text-primary transition-colors"
                >
                  Manage Auctions
                </Link>
                <Link
                  to="/dashboard/admin/pending-auctions"
                  className="hover:text-primary transition-colors"
                >
                  Approve Auctions
                </Link>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 mt-2 flex flex-col gap-3 text-text-muted text-[16px]">
            <Link
              to="/auction"
              className="hover:text-primary transition-colors"
            >
              Create Auction
            </Link>
            <Link
              to="/dashboard/auctions/me"
              className="hover:text-primary transition-colors"
            >
              Own Auctions
            </Link>
            <Link
              to="/dashboard/bids/me"
              className="hover:text-primary transition-colors"
            >
              My Bids & Wins
            </Link>
            <Link
              to="/dashboard/transactions"
              className="hover:text-primary transition-colors"
            >
              Transaction History
            </Link>
            {myId && (
              <Link
                to={`/user/${myId}`}
                className="hover:text-primary transition-colors"
              >
                Public Profile
              </Link>
            )}
            <Link
              to="/dashboard/register-buyer"
              className="hover:text-primary transition-colors"
            >
              Register Buyer
            </Link>
            <Link
              to="/dashboard/register-seller"
              className="hover:text-primary transition-colors"
            >
              Register Seller
            </Link>
          </div>
        </div>

        {/* Delete user */}
        <div className="pt-8 mt-4 border-t border-border">
          <button
            onClick={handleDeleteAccount}
            disabled={isPending}
            className="w-full py-2.5 text-[10px] bg-red-600 font-bold uppercase tracking-widest text-white border border-red-800 rounded-lg hover:bg-red-800 transition-colors"
          >
            {isPending ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 min-h-[400px]">
        <Outlet />
      </div>
    </div>
  );
}
