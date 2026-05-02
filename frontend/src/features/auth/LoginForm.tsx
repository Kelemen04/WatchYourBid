import { useLogin } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { LoginSchema, type LoginDTO } from "../../dto/auth.dto";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";

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
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col bg-pimary text-center px-20"
        noValidate
      >
        <label
          htmlFor="username-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Username:
        </label>
        {errors.username && <span>{errors.username?.message}</span>}
        <input
          id="username-input"
          type="text"
          className="w-xs border rounded-2xl p-2 text-black"
          {...register("username")}
        />
        <label
          htmlFor="password-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Password:
        </label>
        <input
          id="password-input"
          type="password"
          className="w-xs border rounded-2xl p-2 text-black"
          {...register("password")}
        />
        {errors.password && <span>{errors.password?.message}</span>}
        <button
          type="submit"
          disabled={isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
        <a href="/forgot-password">Forgot password</a>
      </form>
    </>
  );
}
