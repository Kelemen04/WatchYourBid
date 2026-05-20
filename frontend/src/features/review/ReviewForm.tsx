import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { ReviewSchema, type ReviewDTO } from "../../dto/review.dto";
import { useReviewCreate } from "../../hooks/useReview";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useState } from "react";

export default function ReviewForm() {
  const { id } = useParams();
  const auctionId = Number(id);
  const { mutate, isPending } = useReviewCreate();

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ReviewDTO>({
    resolver: zodResolver(ReviewSchema),
    mode: "onTouched",
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const currentRating = watch("rating");

  const onSubmit = (data: ReviewDTO) => {
    mutate(
      { reviewData: data, auctionId },
      {
        onSuccess: () => {
          reset();
        },
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

  const handleRatingClick = (rate: number) => {
    setValue("rating", rate, { shouldValidate: true });
    trigger("rating");
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col bg-pimary text-center px-20"
        noValidate
      >
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex flex-row gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverRating ?? currentRating);

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="cursor-pointer transition-transform hover:scale-110 p-1"
                >
                  <Star
                    size={32}
                    className={`transition-colors duration-200 ${
                      isFilled
                        ? "fill-primary text-primary"
                        : "text-text-muted/40 fill-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {errors.rating && (
            <span className="text-red-500 text-xs mt-2 font-medium">
              {errors.rating.message}
            </span>
          )}
        </div>
        <input
          id="comment"
          type="text"
          className="w-xs border rounded-2xl p-2 text-black"
          {...register("comment")}
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5 disabled:opacity-50"
        >
          {isPending ? "Creating review..." : "Review"}
        </button>
      </form>
    </>
  );
}
