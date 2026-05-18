import { Link, useNavigate, Outlet } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import { useNavbar } from "../../hooks/useNavbar";
import { getAccessToken } from "../../api/axios";
import { BsBookmark } from "react-icons/bs";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useLogout();

  const isAuthenticated = () => {
    return getAccessToken() !== null;
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate("/home");
  };

  const { data } = useNavbar();

  const profilePicture = data?.profilePicture;

  console.log("prof ", profilePicture);

  return (
    <>
      <nav className="flex items-center flex-row font-playfair font-bold text-primary justify-between gap-x-20 w-full h-20 bg-surface px-10">
        <Link to="/home" className="h-full">
          <img
            src="./public/images/WatchYourBid1.png"
            alt="Logo"
            className="h-full"
          />
        </Link>
        <div className="flex flex-row items-center gap-x-15">
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-amber-500 transition-colors uppercase font-medium font-bold">
              Category
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div className="absolute left-0 mt-2 w-48 font-playfair bg-white text-slate-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <Link
                to="/auction/category/wristwatch"
                className="block px-4 py-3 hover:bg-slate-100 rounded-t-lg"
              >
                Wristwatches
              </Link>
              <Link
                to="/auction/category/pocketwatch"
                className="block px-4 py-3 hover:bg-slate-100"
              >
                Pocket Watches
              </Link>
              <Link
                to="/auction/category/clock"
                className="block px-4 py-3 hover:bg-slate-100"
              >
                Clocks
              </Link>
              <Link
                to="/auction/category/smartwatch"
                className="block px-4 py-3 hover:bg-slate-100 rounded-b-lg"
              >
                Smartwatches
              </Link>
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="&#x1F50E;&#xFE0E; Search for auctions"
              className="h-10 w-2xl bg-white shadow-primary shadow-md border-0.5 p-2 rounded-2xl"
            />
          </div>
        </div>
        <div className="flex flex-row justify-end divide-x-2 divide-solid">
          {!isAuthenticated() && (
            <>
              <Link to="/login" className="px-2">
                Login
              </Link>
              <Link to="/register" className="px-2">
                Register
              </Link>
            </>
          )}
          {isAuthenticated() && (
            <>
              <Link to="/watchlist" className="px-2">
                <BsBookmark />
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-3 hover:text-amber-500 transition-colors uppercase font-medium font-bold">
                  {data ? (
                    <>
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <img
                          src="/images/no_profile.png"
                          alt="No Profile"
                          className="w-10 h-10 rounded-lg"
                        />
                      )}
                      <p className="normal-case font-semibold text-sm">
                        {data?.username}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Loading...</span>
                  )}

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div className="absolute left-0 mt-2 w-48 font-playfair bg-white text-slate-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <p>Balance: {data?.balance}</p>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/logout"
                    onClick={handleLogout}
                    className="block px-4 py-3 hover:bg-slate-100"
                  >
                    Logout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
