import {
  RegisterFormSchema,
  RegisterSchema,
  type RegisterFormDTO,
} from "../../dto/auth.dto";
import { useRegister } from "../../hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<RegisterFormDTO>({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onTouched",
  });

  const { mutate, isPending, isSuccess } = useRegister();

  const onSubmit = (data: RegisterFormDTO) => {
    const backendData = RegisterSchema.parse(data);
    mutate(backendData, {
      onError: (err) => {
        const serverError = err as AxiosError<{ error: string }>;
        const msg = serverError?.response?.data?.error;

        setError("username", {
          type: "server",
          message: msg,
        });
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white border border-stone-100 rounded-3xl shadow-xl max-w-md mx-auto mt-12 text-center">
        <h2 className="font-playfair text-3xl font-bold text-surface mb-4">
          Welcome aboard!
        </h2>

        <p className="font-inter text-stone-600 mb-8 leading-relaxed">
          We've sent a verification email to your inbox. Please check your email
          to activate your account.
        </p>

        <Link
          to="/login"
          className="w-full bg-surface text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all duration-300 shadow-md"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="my-8">
      {/* LOGO */}
      <div className="flex justify-center items-center w-full">
        <img
          src="./public/images/WatchYourBid.png"
          alt="Logo"
          className="w-48"
        />
      </div>

      {/* Title */}
      <h1 className="text-center font-playfair text-text-muted text-4xl mt-3">
        Join WatchYourBid community!
      </h1>
      <h2 className="text-center m-4 font-playfair text-text-muted text-xl">
        Create an account to start bidding!
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full max-w-sm mx-auto bg-white px-8 rounded-2xl gap-3"
        noValidate
      >
        {/* Username Group */}
        <div className="flex flex-col w-full">
          <label
            htmlFor="username-input"
            className="text-left font-inter text-text-muted text-sm font-bold tracking-wide uppercase mb-1.5"
          >
            Username
          </label>
          <input
            id="username-input"
            type="text"
            className={`w-full border rounded-2xl p-2 text-black focus:outline-none focus:border-primary transition-colors ${
              errors.username ? "border-red-500" : "border-gray-300"
            }`}
            {...register("username")}
          />
          {errors.username && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.username.message}
            </span>
          )}
        </div>

        {/* Email Group */}
        <div className="flex flex-col w-full">
          <label
            htmlFor="email-input"
            className="text-left font-inter text-text-muted text-sm font-bold tracking-wide uppercase mb-1.5"
          >
            Email
          </label>
          <input
            id="email-input"
            type="email"
            className={`w-full border rounded-2xl p-2 text-black focus:outline-none focus:border-primary transition-colors ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password Group */}
        <div className="flex flex-col w-full">
          <label
            htmlFor="password-input"
            className="text-left font-inter text-text-muted text-sm font-bold tracking-wide uppercase mb-1.5"
          >
            Password
          </label>
          <input
            id="password-input"
            type="password"
            className={`w-full border rounded-2xl p-2 text-black focus:outline-none focus:border-primary transition-colors ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm Password Group */}
        <div className="flex flex-col w-full">
          <label
            htmlFor="confirm-input"
            className="text-left font-inter text-text-muted text-sm font-bold tracking-wide uppercase mb-1.5"
          >
            Confirm Password
          </label>
          <input
            id="confirm-input"
            type="password"
            className={`w-full border rounded-2xl p-2 text-black focus:outline-none focus:border-primary transition-colors ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full text-white mt-2 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-primary/50 font-bold tracking-widest uppercase rounded-2xl text-sm px-4 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Registering..." : "Register"}
        </button>

        {/* Back to login */}
        <div className="text-center mt-2 mb-4">
          <span className="text-sm text-text-muted font-inter">
            Already have an account?{" "}
          </span>
          <Link
            to="/login"
            className="text-sm font-bold text-background hover:text-primary transition-colors"
          >
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
