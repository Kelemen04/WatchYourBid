import { Link } from "react-router-dom";

export default function UserDashboard() {
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
    </>
  );
}
