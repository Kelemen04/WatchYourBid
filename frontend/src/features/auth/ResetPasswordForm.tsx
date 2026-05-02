import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PasswordResetSchema,
  PasswordResetFormSchema,
  type PasswordResetFormDTO,
} from "../../dto/auth.dto";
import { useResetPassword } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";

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

    const rest = PasswordResetSchema.parse(data);

    mutate(
      { ...rest, token },
      {
        onError: (err) => {
          const serverError = err as AxiosError<{ error: string }>;
          const msg = serverError?.response?.data?.error;

          setError("newPassword", {
            type: "server",
            message: msg,
          });
        },
      },
    );
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
      <form
        className="flex flex-col bg-pimary text-center px-20"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label
          htmlFor="password-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Password:
        </label>
        <input
          id="password-input"
          type="password"
          {...register("newPassword")}
          className="w-xs border rounded-2xl border-gray-300"
        />
        {errors.newPassword && <span>{errors.newPassword?.message}</span>}

        <label
          htmlFor="confirm-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Confirm password:
        </label>
        <input
          id="confirm-input"
          type="password"
          {...register("confirmNewPassword")}
          className="w-xs border rounded-2xl border-gray-300"
        />
        {errors.confirmNewPassword && (
          <span>{errors.confirmNewPassword?.message}</span>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Resetting password..." : "Reset password"}
        </button>
      </form>
    </>
  );
}
