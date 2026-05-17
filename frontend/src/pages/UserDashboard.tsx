import { Link, useNavigate } from "react-router-dom";
import { useDeleteMe } from "../hooks/useUser";

export default function UserDashboard() {
  const { mutate, isPending } = useDeleteMe();
  const navigate = useNavigate();

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
    <>
      <Link to="/auction">
        <div>CREATE AUCTION</div>
      </Link>
      <Link to="/dashboard/register-buyer">
        <div>REGISTER BUYER</div>
      </Link>
      <Link to="/dashboard/register-seller">
        <div>REGISTER SELLER</div>
      </Link>
      <button
        onClick={handleDeleteAccount}
        disabled={isPending}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-400"
      >
        {isPending ? "Deleting account..." : "Delete account"}
      </button>
    </>
  );
}
