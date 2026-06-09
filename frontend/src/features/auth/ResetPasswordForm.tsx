import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PasswordResetFormSchema,
  type PasswordResetFormDTO,
} from "../../dto/auth.dto";
import { useResetPassword } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const { mutate, isPending, isSuccess } = useResetPassword();

  const {
    handleSubmit,
    setError,
    register,
    formState: { errors },
  } = useForm<PasswordResetFormDTO>({
    resolver: zodResolver(PasswordResetFormSchema),
  });

  const onSubmit = (data: PasswordResetFormDTO) => {
    if (!token) {
      alert("Missing token! Please use the link from your email.");
      return;
    }

    mutate(
      { newPassword: data.newPassword, token },
      {
        onSuccess: (data) => {
          console.log("SUCCESS:", data);
        },
        onError: (err) => {
          console.log("ERROR:", err);
          const serverError = err as AxiosError<{ error: string }>;
          setError("newPassword", {
            type: "server",
            message: serverError?.response?.data?.error,
          });
        },
      },
    );
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-playfair text-3xl font-bold text-background mb-4">
          Success!
        </h2>
        <p className="text-text-muted text-sm text-center mb-8">
          Your password has been reset successfully.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full text-white bg-gradient-to-r from-background to-primary-hover font-bold tracking-widest uppercase rounded-xl text-sm px-4 py-3 text-center transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-center items-center w-full">
        <img src="/images/WatchYourBid.png" alt="Logo" className="w-48" />
      </div>

      <h1 className="text-center font-playfair text-text-muted text-4xl">
        Reset Password
      </h1>
      <h2 className="text-center m-8 font-playfair text-text-muted text-xl">
        Please enter your new password below.
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full max-w-sm mx-auto bg-white px-8 rounded-2xl gap-3"
        noValidate
      >
        <div className="flex flex-col w-full">
          <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
            New Password
          </label>
          <input
            type="password"
            {...register("newPassword")}
            className={`w-full border rounded-2xl p-2 text-black focus:outline-none focus:border-primary transition-colors ${
              errors.newPassword ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.newPassword && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.newPassword.message}
            </span>
          )}
        </div>

        <div className="flex flex-col w-full">
          <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            {...register("confirmNewPassword")}
            className={`w-full border rounded-2xl p-2 text-black focus:outline-none focus:border-primary transition-colors ${
              errors.confirmNewPassword ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.confirmNewPassword && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.confirmNewPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full text-white mt-2 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-primary/50 font-bold tracking-widest uppercase rounded-2xl text-sm px-4 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Resetting..." : "Reset Password"}
        </button>

        <Link
          to="/login"
          className="text-xs text-text-muted hover:text-primary transition-colors text-center mt-2 font-bold uppercase tracking-wider"
        >
          Cancel and go back to Login
        </Link>
      </form>
    </div>
  );
}
