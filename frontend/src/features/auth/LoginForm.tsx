import { useLogin } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { LoginSchema, type LoginDTO } from "../../dto/auth.dto";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Link } from "react-router-dom"; // <-- A sima <a> tag helyett!

export default function LoginForm() {
  const { mutate, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginDTO>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: LoginDTO) => {
    mutate(data, {
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

  return (
    <div>
      <div className="flex justify-center items-center w-full">
        <img
          src="./public/images/WatchYourBid.png"
          alt="Logo"
          className="w-48"
        />
      </div>
      <h1 className="text-center font-playfair text-text-muted text-4xl">
        Welcome to WatchYourBid!
      </h1>
      <h2 className="text-center m-8 font-playfair text-text-muted text-xl">
        Start your experience by signing in or signing up!
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full text-white mt-2 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-primary/50 font-bold tracking-widest uppercase rounded-2xl text-sm px-4 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>

        {/* Forgot Password Link */}
        <Link
          to="/forgot-password"
          className="text-sm text-text-muted hover:text-primary transition-colors text-start font-bold"
        >
          Forgot password?
        </Link>

        <div className="text-center mt-2">
          <span className="text-sm text-text-muted font-inter">
            Don't have an account?{" "}
          </span>
          <Link
            to="/register"
            className="text-sm font-bold text-background hover:text-primary transition-colors"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
