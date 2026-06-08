import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useWithdrawMoney } from "../../hooks/useTransactions";
import {
  UploadMoneySchema,
  type UploadMoneyDTO,
} from "../../dto/transaction.dto";

export default function WithdrawForm() {
  const { mutate, isPending } = useWithdrawMoney();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UploadMoneyDTO>({
    resolver: zodResolver(UploadMoneySchema),
    mode: "onTouched",
  });

  const onSubmit = (data: UploadMoneyDTO) => {
    mutate(data, {
      onSuccess: () => reset(),
      onError: (err) => {
        const serverError = err as AxiosError<{ error: string }>;
        const msg = serverError?.response?.data?.error;
        setError("root", { type: "server", message: msg });
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 w-full"
    >
      <input
        type="number"
        className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-background focus:border-primary outline-none"
        placeholder="Amount"
        {...register("amount", { valueAsNumber: true })}
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-transparent border border-primary text-primary font-bold uppercase tracking-widest text-[10px] py-2 rounded-lg hover:bg-primary hover:text-black transition-colors disabled:opacity-50"
      >
        {isPending ? "Withdrawing..." : "Withdraw"}
      </button>
      {errors.amount && (
        <span className="text-red-500 text-[10px]">
          {errors.amount.message}
        </span>
      )}
      {errors.root && (
        <span className="text-red-500 text-[10px]">{errors.root.message}</span>
      )}
    </form>
  );
}
