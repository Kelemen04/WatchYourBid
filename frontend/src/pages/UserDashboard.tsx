import { Link } from "react-router-dom";

export default function UserDashboard() {
  return (
    <>
      <Link to="/auction">
        <div>CREATE AUCTION</div>
      </Link>
    </>
  );
}
