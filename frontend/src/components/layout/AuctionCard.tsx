import { useEffect, useState } from "react";
import type { AuctionCardData } from "../../dto/auction.dto";
import { Link } from "react-router-dom";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useAddToWatchlist } from "../../hooks/useAuctions";
import { useQueryClient } from "@tanstack/react-query";

export default function AuctionCard({ auction }: { auction: AuctionCardData }) {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const difference =
        new Date(auction.endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft("0D 0H 0M 0S");
        setIsEnded(true);
        return;
      }

      setIsEnded(false);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}D ${hours}H ${minutes}M ${seconds}S`);
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime]);

  const { mutate } = useAddToWatchlist();

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    mutate(
      { auctionId: auction.id },
      {
        onSuccess: (data) => {
          alert(data.message);
          queryClient.invalidateQueries({ queryKey: ["homeAuctions"] });
        },
        onError: (err) => {
          alert(err.response?.data?.error || "Failed to add to watchlist");
        },
      },
    );
  };

  return (
    <Link to={`/auction/${auction.id}`} className="group block w-full h-full">
      <div className="w-full h-full bg-white border border-gray-300 rounded-2xl p-4 flex flex-col gap-3 hover:border-primary hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 relative">
        {/* Photo */}
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
          {auction.images && auction.images.length > 0 ? (
            <img
              src={auction.images[0]}
              alt={auction.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 font-inter text-xs font-bold uppercase tracking-widest">
                No Image
              </span>
            </div>
          )}

          {/* Watchlist save button. */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleWatchlistClick(e);
            }}
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 text-gray-400 hover:text-primary hover:border-primary shadow-sm transition-all z-10"
            title={
              auction.isWatchlisted
                ? "Remove from watchlist"
                : "Add to watchlist"
            }
          >
            {auction.isWatchlisted ? (
              <BsBookmarkFill className="w-4 h-4 text-primary" />
            ) : (
              <BsBookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title text */}
        <div className="flex flex-col mt-1">
          <h3 className="font-playfair text-lg font-bold text-surface truncate group-hover:text-primary transition-colors">
            {auction.title}
          </h3>
        </div>

        {/* Price and Countdown */}
        <div className="mt-auto border-t border-gray-100 pt-3 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="font-inter text-[10px] uppercase font-bold tracking-wider text-text-muted">
              Current Bid
            </span>
            <span className="font-inter text-lg font-extrabold text-surface leading-none">
              €{auction.currentPrice?.toLocaleString()}
            </span>
          </div>

          <div className="bg-surface py-1 px-2 text-center rounded-lg shadow-sm">
            {isEnded ? (
              <span className="font-mono text-[14px] font-bold text-primary tracking-widest">
                ENDED
              </span>
            ) : (
              <span className="font-mono text-[14px] font-bold text-primary tracking-widest">
                {timeLeft}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
