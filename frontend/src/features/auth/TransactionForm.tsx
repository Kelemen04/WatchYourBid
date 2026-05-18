import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useUploadMoney } from "../../hooks/useTransactions";
import {
  UploadMoneySchema,
  type UploadMoneyDTO,
} from "../../dto/transaction.dto";

export default function TransactionForm() {
  const { mutate, isPending } = useUploadMoney();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UploadMoneyDTO>({
    resolver: zodResolver(UploadMoneySchema),
    mode: "onTouched",
  });

  const onSubmit = (data: UploadMoneyDTO) => {
    mutate(data, {
      onError: (err) => {
        const serverError = err as AxiosError<{ error: string }>;
        const msg = serverError?.response?.data?.error;

        setError("root", {
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
          htmlFor="money-input"
          className="text-left ml-30 py-2 font-inter text-text-muted text-xl"
        >
          Amount:
        </label>
        {errors.amount && <span>{errors.amount?.message}</span>}
        <input
          id="money-input"
          type="number"
          className="w-xs border rounded-2xl p-2 text-black"
          {...register("amount", { valueAsNumber: true })}
        />

        <button
          type="submit"
          disabled={isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Uploading money..." : "Upload money"}
        </button>
      </form>
    </>
  );
}
