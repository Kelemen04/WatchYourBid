import {
  ForgotPasswordSchema,
  type ForgotPasswordDTO,
} from "../../dto/auth.dto";
import { useForgotPassword } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";

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
      <div className="text-center p-10 bg-primary rounded-2xl">
        <h2 className="text-2xl font-bold text-green-500">Check your email!</h2>
        <p className="text-text-muted mt-4">
          We've sent a password reset link to{" "}
          <strong>{getValues("email")}</strong>.
        </p>
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
        <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
          Email:<br></br>
        </label>
        <input
          type="email"
          className="w-xs border rounded-2xl border-gray-300"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-red-500">{errors.email.message}</span>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Send email"}
        </button>
      </form>
    </>
  );
}
