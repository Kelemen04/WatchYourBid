import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlaceBidSchema, type PlaceBidDTO } from "../../dto/bid.dto";
import { useBidCreate } from "../../hooks/useBids";
import type { AxiosError } from "axios";
import { useParams } from "react-router-dom";

export default function BidInformation() {
  const { id } = useParams();
  const { mutate, isPending } = useBidCreate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PlaceBidDTO>({
    resolver: zodResolver(PlaceBidSchema),
    mode: "onTouched",
    defaultValues: {
      auctionId: Number(id),
    },
  });

  const onSubmit = (data: PlaceBidDTO) => {
    mutate(
      { ...data, auctionId: Number(id) },
      {
        onError: (err) => {
          const serverError = err as AxiosError<{ error: string }>;
          const msg = serverError?.response?.data?.error;

          setError("root", {
            type: "server",
            message: msg,
          });
        },
      },
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Place bid</label>
        <input
          {...register("bidAmount", { valueAsNumber: true })}
          type="number"
          placeholder="Write a number here..."
        ></input>

        {errors.bidAmount && (
          <p className="text-red-500 text-xs">Invalid number!</p>
        )}
        {errors.root && (
          <p className="text-red-600 font-bold my-2">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Placing bid..." : "Place bid"}
        </button>
      </form>
    </>
  );
}
