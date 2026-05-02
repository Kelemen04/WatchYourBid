import {
  RegisterFormSchema,
  RegisterSchema,
  type RegisterFormDTO,
} from "../../dto/auth.dto";
import { useRegister } from "../../hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";

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
      <div className="text-center p-10 bg-primary rounded-2xl border-2 border-green-500">
        <h2 className="text-2xl font-bold text-green-500 italic uppercase">
          Welcome on board!
        </h2>
        <a href="/login" className="inline-block mt-6 underline font-bold">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col bg-pimary text-center px-20"
      >
        <label
          htmlFor="username-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Username:
        </label>
        <input
          id="username-input"
          type="text"
          {...register("username")}
          className={`w-xs border rounded-2xl border-gray-300`}
        />
        {errors.username && <span>{errors.username?.message}</span>}

        <label
          htmlFor="email-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Email:
        </label>
        <input
          id="email-input"
          type="text"
          {...register("email")}
          className={`w-xs border rounded-2xl border-gray-300`}
        />
        {errors.email && <span>{errors.email?.message}</span>}

        <label
          htmlFor="password-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Password:
        </label>
        <input
          id="password-input"
          type="password"
          {...register("password")}
          className={`w-xs border rounded-2xl border-gray-300`}
        />
        {errors.password && <span>{errors.password?.message}</span>}

        <label
          htmlFor="confirm-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Confirm password:<br></br>
        </label>
        <input
          id="confirm-input"
          type="password"
          {...register("confirmPassword")}
          className={`w-xs border rounded-2xl border-gray-300`}
        />
        {errors.confirmPassword && (
          <span>{errors.confirmPassword?.message}</span>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Registering..." : "Register"}
        </button>
      </form>
    </>
  );
}
