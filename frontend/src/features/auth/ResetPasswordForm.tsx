import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PasswordResetSchema } from "../../dto/auth.dto";
import { useResetPassword } from "../../hooks/useAuth";

export default function ResetPassword() {
  const userRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [pwd, setPwd] = useState("");
  const [matchPwd, setMatchPwd] = useState("");

  const validation = PasswordResetSchema.safeParse({
    newPassword: pwd,
    token: token,
  });

  const isMatch = pwd === matchPwd && pwd !== "";

  const { mutate, isPending, error, isSuccess } = useResetPassword();

  const serverError = error?.response?.data?.error || "";

  const handleSubmit = (e: React.FormEvent) => {
    console.log("IDE");
    e.preventDefault();

    if (!token) {
      alert("Missing token! Please use the link from your email.");
      return;
    }

    if (validation.success && isMatch) {
      console.log(token + " " + pwd);
      mutate({ token: token, newPassword: pwd });
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-10 bg-primary rounded-2xl">
        <h2 className="text-2xl font-bold text-green-500">Success!</h2>
        <p className="mt-4">Your password has been reset successfully.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 bg-background text-white px-6 py-2 rounded-xl"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <p className={serverError ? "text-red-500 font-bold" : "hidden"}>
        {serverError}
      </p>
      <form
        className="flex flex-col bg-pimary text-center px-20"
        onSubmit={handleSubmit}
      >
        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Password:<br></br>
          <input
            ref={userRef}
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-xs border rounded-2xl border-gray-300"
          />
        </label>

        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Confirm password:<br></br>
          <input
            ref={userRef}
            type="password"
            value={matchPwd}
            onChange={(e) => setMatchPwd(e.target.value)}
            className="w-xs border rounded-2xl border-gray-300"
          />
        </label>

        <button
          type="submit"
          disabled={!validation.success || !isMatch || isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Resetting password..." : "Reset password"}
        </button>
      </form>
    </>
  );
}
