import {
  ForgotPasswordSchema,
  type ForgotPasswordDTO,
} from "../../dto/auth.dto";
import { useForgotPassword } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { MdOutlineMarkEmailRead } from "react-icons/md";

export default function EmailForm() {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordDTO>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onTouched",
  });

  const { mutate, isPending, isSuccess } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordDTO) => {
    mutate(data, {
      onError: (err: unknown) => {
        const axiosError = err as AxiosError<{ error: string }>;
        const msg =
          axiosError?.response?.data?.error || "Something went wrong!";

        setError("email", {
          type: "server",
          message: msg,
        });
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto bg-white p-8">
        <MdOutlineMarkEmailRead className="w-16 h-16 text-green-600" />

        <h2 className="font-playfair text-4xl font-bold text-background mb-3 text-center">
          Check Your Inbox
        </h2>

        <p className="font-inter text-text-muted text-lg text-center leading-relaxed my-8">
          We've sent a secure password reset link to: <br />
          <strong className="block mt-2 text-background text-base font-bold">
            {getValues("email")}
          </strong>
        </p>

        <Link
          to="/login"
          className="w-8/10 text-white bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-primary/50 font-bold tracking-widest uppercase rounded-2xl text-sm px-4 py-3 text-center transition-all"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Logo */}
      <div className="flex justify-center items-center w-full">
        <img
          src="./public/images/WatchYourBid.png"
          alt="Logo"
          className="w-48"
        />
      </div>

      <h1 className="text-center font-playfair text-text-muted text-4xl mt-5">
        Reset Password
      </h1>
      <h2 className="text-center m-8 font-playfair text-text-muted text-xl">
        Enter your email to receive a reset link.
      </h2>

      <form
        className="flex flex-col w-full max-w-sm mx-auto bg-white px-8 rounded-2xl gap-3"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full text-white mt-2 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-primary/50 font-bold tracking-widest uppercase rounded-2xl text-sm px-4 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Sending..." : "Send reset link"}
        </button>

        <div className="text-center mt-2 mb-4">
          <span className="text-sm text-text-muted font-inter">
            Remembered your password?{" "}
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
