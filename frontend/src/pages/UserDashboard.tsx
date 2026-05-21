import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDeleteMe } from "../hooks/useUser";
import TransactionForm from "../features/auth/TransactionForm";
import WithdrawForm from "../features/auth/WithdrawForm";
import { getUserId, getUserRole } from "../api/axios";

export default function UserDashboard() {
  const { mutate, isPending } = useDeleteMe();
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
    <div style={{ display: "flex", gap: "30px", padding: "20px" }}>
      <div
        style={{
          border: "2px solid black",
          padding: "15px",
          width: "250px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          height: "fit-content",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            borderBottom: "1px solid black",
            paddingBottom: "5px",
          }}
        >
          Dashboard
        </h3>

        {isAdmin && (
          <div style={{ marginTop: "20px", borderBottom: "1px solid #333" }}>
            <h4 style={{ color: "#047857", marginBottom: "5px" }}>ADMIN</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                marginBottom: "15px",
              }}
            >
              <Link to="/dashboard/admin/manage-users">Manage Users</Link>
              <Link to="/dashboard/admin/manage-auctions">Manage Auctions</Link>
              <Link to="/dashboard/admin/pending-auctions">
                Approve Auctions
              </Link>
            </div>
          </div>
        )}

        {isMod && (
          <div style={{ marginTop: "20px", borderBottom: "1px solid #333" }}>
            <h4 style={{ color: "#047857", marginBottom: "5px" }}>MODERATOR</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                marginBottom: "15px",
              }}
            >
              <Link to="/dashboard/admin/manage-auctions">Manage Auctions</Link>
              <Link to="/dashboard/admin/pending-auctions">
                Approve Auctions
              </Link>
            </div>
          </div>
        )}

        <Link to="/auction">
          <div>Create Auction</div>
        </Link>
        <Link to="/dashboard/auctions/me">
          <div>Own Auctions</div>
        </Link>
        <Link to="/dashboard/bids/me">
          <div>My Bids & Wins</div>
        </Link>
        <Link to="/dashboard/transactions">
          <div>Transaction History</div>
        </Link>

        {myId && (
          <Link to={`/user/${myId}`}>
            <div style={{ color: "blue" }}>Public Profile</div>
          </Link>
        )}

        <Link to="/dashboard/register-buyer">
          <div>Register Buyer</div>
        </Link>
        <Link to="/dashboard/register-seller">
          <div>Register Seller</div>
        </Link>

        <div
          style={{
            borderTop: "1px dashed gray",
            paddingTop: "10px",
            marginTop: "10px",
          }}
        >
          <TransactionForm />
          <div style={{ margin: "10px 0" }} />
          <WithdrawForm />
        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={isPending}
          style={{
            backgroundColor: "red",
            color: "white",
            fontWeight: "bold",
            padding: "5px",
            cursor: "pointer",
            marginTop: "15px",
          }}
        >
          {isPending ? "Deleting..." : "Delete Account"}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid silver",
          padding: "20px",
          minHeight: "400px",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
