import { useState, useRef } from "react";
import { RegisterSchema } from "../../dto/auth.dto";
import { useRegister } from "../../hooks/useAuth";

export default function RegisterForm() {
  const userRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [matchPwd, setMatchPwd] = useState("");

  const validation = RegisterSchema.safeParse({
    username,
    email,
    password: pwd,
  });

  const fieldErrors = !validation.success
    ? validation.error.flatten().fieldErrors
    : {};
  const isMatch = pwd === matchPwd && pwd !== "";

  const { mutate, isPending, error } = useRegister();

  const serverError = error?.response?.data?.error || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.success && isMatch) {
      mutate({ username, email, password: pwd });
    }
  };

  return (
    <>
      <p className={serverError ? "text-red-500 font-bold" : "hidden"}>
        {serverError}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-pimary text-center px-20"
      >
        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Username:<br></br>
          <input
            ref={userRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-xs border rounded-2xl ${username && fieldErrors.username ? "border-red-500" : "border-gray-300"}`}
          />
        </label>

        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Email:<br></br>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-xs border rounded-2xl ${email && fieldErrors.email ? "border-red-500" : "border-gray-300"}`}
          />
        </label>

        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Password:<br></br>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className={`w-xs border rounded-2xl ${pwd && fieldErrors.password ? "border-red-500" : "border-gray-300"}`}
          />
        </label>

        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Confirm password:<br></br>
          <input
            type="password"
            value={matchPwd}
            onChange={(e) => setMatchPwd(e.target.value)}
            className={`w-xs border rounded-2xl ${matchPwd && !isMatch ? "border-red-500" : "border-gray-300"}`}
          />
        </label>

        <button
          type="submit"
          disabled={!validation.success || !isMatch || isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Registering..." : "Register"}
        </button>
      </form>
    </>
  );
}
