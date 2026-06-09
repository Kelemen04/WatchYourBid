import { Link, Outlet } from "react-router-dom";
import { BsHouse } from "react-icons/bs";

export default function AuthLayout() {
  return (
    <main className="min-h-[calc(100vh-4rem)] grid grid-cols-2 m-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
      <div className="bg-white rounded-l-2xl relative flex flex-col justify-center items-center">
        <Link
          to="/home"
          className="absolute top-6 left-6 bg-text-muted/30 p-2 rounded-2xl flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-inter font-bold text-sm uppercase tracking-wider"
        >
          <BsHouse className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Outlet />
      </div>

      <div className="h-full w-full bg-[url('./public/images/login-photo.jpg')] bg-cover bg-center flex justify-center items-center rounded-r-2xl">
        <div className="h-full w-full backdrop-blur-xs bg-white/0.01 border border-white/1 rounded-2xl p-8">
          <h1 className="font-playfair my-10 text-6xl text-center text-white">
            Don't just watch time. <span className="text-primary">Own it.</span>
          </h1>

          <p className="text-2xl my-20 text-white font-inter">
            Step into the ultimate arena of precision and passion, where every
            second counts toward your next victory. From vintage legends to
            modern masterpieces, our global marketplace connects you with the
            rarest timepieces in the world. Secure your legacy, master the art
            of the bid, and make sure the final second belongs to you.
          </p>
        </div>
      </div>
    </main>
  );
}
