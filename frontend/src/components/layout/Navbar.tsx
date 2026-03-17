import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center flex-row font-playfair font-bold text-primary justify-between gap-x-20 w-screen h-20 bg-surface px-10">
      <Link to="/home" className="h-full">
        <img
          src="./public/images/WatchYourBid1.png"
          alt="Logo"
          className="h-full"
        />
      </Link>
      <div className="flex flex-row  items-center gap-x-15">
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
              to="/auctions?cat=wristwatches"
              className="block px-4 py-3 hover:bg-slate-100 rounded-t-lg"
            >
              Wristwatches
            </Link>
            <Link
              to="/auctions?cat=pocket-watches"
              className="block px-4 py-3 hover:bg-slate-100"
            >
              Pocket Watches
            </Link>
            <Link
              to="/auctions?cat=clocks"
              className="block px-4 py-3 hover:bg-slate-100"
            >
              Clocks
            </Link>
            <Link
              to="/auctions?cat=smartwatches"
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
        <Link to="/login" className="px-2">
          Login
        </Link>
        <Link to="/register" className="px-2">
          Register
        </Link>
      </div>
    </nav>
  );
}
