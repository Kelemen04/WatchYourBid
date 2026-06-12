import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { ReviewSchema, type ReviewDTO } from "../../dto/review.dto";
import { useReviewCreate } from "../../hooks/useReview";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import type { AuctionFullData } from "../../dto/auction.dto";

interface ReviewFormProps {
  auctionData: AuctionFullData;
}

export default function ReviewForm({ auctionData }: ReviewFormProps) {
  const { id } = useParams();
  const auctionId = Number(id);
  const { mutate, isPending } = useReviewCreate();

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    defaultValues: { rating: 0, comment: "" },
  });

  const currentRating = watch("rating");

  const onSubmit = (data: ReviewDTO) => {
    mutate(
      { reviewData: data, auctionId },
      {
        onSuccess: () => {
          reset();
          setIsSubmitted(true);
        },
        onError: (err) => {
          const serverError = err as AxiosError<{ error: string }>;
          const msg = serverError?.response?.data?.error || "Review failed.";

          if (msg.toLowerCase().includes("already")) {
            setIsSubmitted(true);
          } else {
            setError("root", { type: "server", message: msg });
          }
        },
      },
    );
  };

  const handleRatingClick = (rate: number) => {
    setValue("rating", rate, { shouldValidate: true });
    trigger("rating");
  };

  // 1. Állapot: Ha most küldted el sikeresen
  if (isSubmitted) {
    return (
      <div className="w-full bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
        <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-background mb-2">
          Thank you!
        </h3>
        <p className="text-stone-500 font-inter">
          Your review has been successfully submitted.
        </p>
      </div>
    );
  }

  // 2. Állapot: Ha a szerverről jövő adatok alapján már van véleményed
  if (auctionData.hasReviewed) {
    return (
      <div className="w-full bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center shadow-sm">
        <p className="font-inter text-sm font-bold text-stone-600 uppercase tracking-widest">
          You already have a review for this auction.
        </p>
      </div>
    );
  }

  // 3. Állapot: Form megjelenítése
  return (
    <div className="w-full bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
      <h3 className="font-playfair text-4xl font-bold text-background mb-6">
        Leave a Review
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        {/* Csillagok */}
        <div className="flex flex-col items-center">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverRating ?? currentRating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={`transition-colors duration-200 ${
                      isFilled ? "fill-primary text-primary" : "text-stone-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {errors.rating && (
            <span className="text-red-500 text-[11px] mt-2 font-bold uppercase tracking-widest">
              {errors.rating.message}
            </span>
          )}
        </div>

        {/* Komment */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="comment"
            className="text-[14px] font-bold uppercase tracking-[0.2em] text-stone-500"
          >
            Your Feedback
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full border border-stone-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Share your experience..."
            {...register("comment")}
          />
          {errors.comment && (
            <span className="text-red-500 text-[11px] font-bold">
              {errors.comment.message}
            </span>
          )}
        </div>

        {/* Hibák */}
        {errors.root && (
          <p className="text-red-600 text-sm text-center font-medium">
            {errors.root.message}
          </p>
        )}

        {/* Gomb */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-background text-white font-bold uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-primary transition-all disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
