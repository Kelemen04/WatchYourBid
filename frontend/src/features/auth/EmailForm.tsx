import { ForgotPasswordSchema } from "../../dto/auth.dto";
import { useRef, useState } from "react";
import { useForgotPassword } from "../../hooks/useAuth";

export default function EmailForm() {
  const userRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");

  const validation = ForgotPasswordSchema.safeParse({
    email,
  });

  const { mutate, isPending, error, isSuccess } = useForgotPassword();

  const serverError = error?.response?.data?.error || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.success) {
      mutate({ email });
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-10 bg-primary rounded-2xl">
        <h2 className="text-2xl font-bold text-green-500">Check your email!</h2>
        <p className="text-text-muted mt-4">
          We've sent a password reset link to <strong>{email}</strong>.
        </p>
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
          Email:<br></br>
          <input
            ref={userRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-xs border rounded-2xl border-gray-300"
          />
        </label>

        {!validation.success && email && (
          <p className="text-red-400 text-sm">
            Please enter a valid email address.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !validation.success}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Send email"}
        </button>
      </form>
    </>
  );
}
