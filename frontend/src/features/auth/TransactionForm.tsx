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
        setError("root", { type: "server", message: msg });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
      <input
        type="number"
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Amount"
        {...register("amount", { valueAsNumber: true })}
      />

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white px-4 py-1 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Uploading..." : "Upload"}
      </button>

      {errors.amount && (
        <span className="text-red-500 text-xs">{errors.amount.message}</span>
      )}
    </form>
  );
}
