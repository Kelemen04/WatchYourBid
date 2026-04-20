import { useState, useRef, useEffect } from "react";
import { useLogin } from "../../hooks/useAuth";

export default function LoginForm() {
  const userRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending, error } = useLogin();

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      mutate({ username, password });
    }
  };

  const serverError = error?.response?.data?.error || "";

  return (
    <>
      <p
        className={
          serverError ? "text-red-500 font-bold text-center" : "hidden"
        }
      >
        {serverError}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-pimary text-center px-20"
      >
        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Username:
          <br />
          <input
            ref={userRef}
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-xs border rounded-2xl p-2 text-black"
          />
        </label>

        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Password:
          <br />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-xs border rounded-2xl p-2 text-black"
          />
        </label>

        <button
          type="submit"
          disabled={isPending || !username || !password}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}
