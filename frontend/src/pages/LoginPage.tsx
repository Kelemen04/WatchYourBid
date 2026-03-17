import LoginForm from "../features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid grid-cols-2 m-8 shadow-xl/20 rounded-2xl">
      <div className="bg-text rounded-l-2xl">
        <div className="flex justify-center items-center w-full">
          <img
            src="./public/images/WatchYourBid.png"
            alt="Logo"
            className="w-48"
          />
        </div>
        <h1 className="text-center m-5 font-playfair text-text-muted text-4xl">
          Welcome to WatchYourBid!
        </h1>
        <h2 className="text-center m-10 font-playfair text-text-muted text-xl">
          Start your experience by signing in or signing up!
        </h2>

        <LoginForm />

        <div className="flex items-center my-8">
          <div className="flex-grow h-px bg-gray-300 ml-40"></div>

          <span className="flex-shrink mx-4 text-gray-400 text-sm uppercase">
            or
          </span>

          <div className="flex-grow h-px bg-gray-300 mr-40"></div>
        </div>

        <div>
          <button className="border rounded-2xl w-xs h-10 font-inter text-sm mx-62">
            Google
          </button>
        </div>
      </div>

      <div className="h-screen w-full bg-[url('./public/images/login-photo.jpg')] bg-cover bg-center flex justify-center items-center rounded-r-2xl">
        <div className="h-screen w-full backdrop-blur-xs bg-white/0.01 border border-white/1 rounded-2xl p-8">
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
