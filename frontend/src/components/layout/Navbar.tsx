import { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import { useNavbar } from "../../hooks/useNavbar";
import { getAccessToken } from "../../api/axios";
import { BsBookmark } from "react-icons/bs";
import { useAuctionsByFilters } from "../../hooks/useAuctions";

function SearchAutocomplete() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: suggestions, isLoading } = useAuctionsByFilters(
    {
      searchTerm: debouncedValue.length > 1 ? debouncedValue : undefined,
      sortBy: "newest",
    },
    0,
    5,
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      setIsFocused(false);
      navigate(`/auctions?searchTerm=${encodeURIComponent(inputValue.trim())}`);
      setInputValue("");
    }
  };

  return (
    <div className="relative w-80 md:w-96 z-50">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for auctions..."
          className="h-10 w-full bg-white border border-transparent pl-11 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-primary shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 text-sm font-playfair text-stone-800 placeholder:text-stone-400"
        />
        <svg
          className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isFocused && inputValue.length > 1 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-stone-100 overflow-hidden flex flex-col font-playfair transform transition-all duration-300 origin-top">
          {isLoading ? (
            <div className="p-5 text-center text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
              Searching...
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <>
              <div className="flex flex-col py-2">
                {suggestions.map((auction) => (
                  <Link
                    key={auction.id}
                    to={`/auction/${auction.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-text-muted/20 transition-colors group border-b border-text-muted/30 last:border-0"
                  >
                    <div className="w-11 h-11 rounded-md bg-text-muted/20 border border-text-muted/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {auction.images && auction.images.length > 0 ? (
                        <img
                          src={auction.images[0]}
                          alt="Watch"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-text-muted/70 tracking-wider">
                          NO IMG
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-0.5">
                        {auction.brand}
                      </span>
                      <span className="text-[13px] text-background font-semibold truncate group-hover:text-primary transition-colors">
                        {auction.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/auctions?searchTerm=${encodeURIComponent(inputValue.trim())}`,
                  )
                }
                className="p-3.5 w-full text-center bg-stone-50 hover:bg-stone-100 text-[12px] font-bold uppercase tracking-[0.2em] text-primary transition-colors border-t border-text-muted/30"
              >
                View all results
              </button>
            </>
          ) : (
            <div className="p-5 text-center text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// NAVBAR COMPONENT
export default function Navbar() {
  const navigate = useNavigate();
  const logout = useLogout();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isAuthenticated = () => {
    return getAccessToken() !== null;
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate("/home");
  };

  const { data } = useNavbar();
  console.log("NAVBAR ", data);
  const profilePicture = data?.profilePicture;

  return (
    <>
      <nav
        className={`flex items-center flex-row font-playfair justify-between w-full h-20 bg-surface px-10 fixed top-0 left-0 z-50 shadow-md transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* LOGO */}
        <Link to="/home" className="h-[80%] flex items-center shrink-0">
          <img
            src="/images/WatchYourBid1.png"
            alt="Logo"
            className="h-full object-contain"
          />
        </Link>

        <div className="flex flex-row font-playfair items-center gap-x-24 ml-10">
          {/* Category dropdown */}
          <div className="relative group py-7">
            <button className="flex items-center gap-2 text-primary hover:text-amber-500 transition-colors uppercase font-semibold text-base tracking-[0.15em]">
              Category
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180"
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
            <div className="absolute top-[calc(100%-5px)] left-0 w-56 font-playfair bg-white border border-stone-100 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
              <div className="py-2">
                <Link
                  to="/auction/category/wristwatch"
                  className="block mx-5 py-2 hover:text-primary transition-colors text-[18px] font-semibold text-background border-b-1 border-text-muted/20"
                >
                  Wristwatches
                </Link>
                <Link
                  to="/auction/category/pocketwatch"
                  className="block mx-5 py-2 hover:text-primary transition-colors text-[18px] font-semibold text-background border-b-1 border-text-muted/20"
                >
                  Pocket Watches
                </Link>
                <Link
                  to="/auction/category/clock"
                  className="block mx-5 py-2 hover:text-primary transition-colors text-[18px] font-semibold text-background border-b-1 border-text-muted/20"
                >
                  Clocks
                </Link>
                <Link
                  to="/auction/category/smartwatch"
                  className="block mx-5 py-2 hover:text-primary transition-colors text-[18px] font-semibold text-background"
                >
                  Smartwatches
                </Link>
              </div>
            </div>
          </div>

          {/* Search */}
          <SearchAutocomplete />
        </div>

        {/* User section */}
        <div className="flex flex-row items-center justify-end gap-3 font-inter shrink-0">
          {!isAuthenticated() && (
            <div className="flex items-center gap-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-white">
              <Link
                to="/login"
                className="hover:text-primary transition-colors"
              >
                Login
              </Link>
              <div className="w-px h-8 bg-text-muted/50"></div>
              <Link
                to="/register"
                className="hover:text-primary transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {isAuthenticated() && (
            <div className="flex items-center gap-5">
              <Link
                to="/watchlist"
                className="p-2 text-white hover:text-[var(--color-primary)] transition-colors relative group"
              >
                <BsBookmark className="w-6 h-8" />
              </Link>

              <div className="w-px h-10 bg-stone-700 mx-1"></div>

              {/* User Dropdown */}
              <div className="relative group py-5 cursor-pointer">
                <div className="flex items-center gap-3">
                  {data ? (
                    <>
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-semibold text-white">
                          {data?.username}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                          My Account
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden group-hover:opacity-80 transition-opacity bg-white">
                        <img
                          src={profilePicture || "/images/no_profile.png"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
                      Loading...
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-180"
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
                </div>

                <div className="absolute top-[calc(100%-10px)] right-0 w-56 font-inter bg-white border border-stone-100 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-stone-100 bg-stone-50">
                    <p className="text-[10px] text-text-muted/70 uppercase font-bold tracking-[0.2em] mb-1.5">
                      Available Balance
                    </p>
                    <p className="font-inter text-xl font-bold text-primary">
                      €{data?.balance?.toLocaleString("en-US") || 0}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      className="block px-5 py-3 hover:bg-text-muted/10 transition-colors text-[13px] font-bold text-stone-700 hover:text-primary"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 hover:bg-red-50 transition-colors text-[13px] font-bold text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="content min-h-screen mt-20">
        <Outlet />
      </div>
    </>
  );
}
