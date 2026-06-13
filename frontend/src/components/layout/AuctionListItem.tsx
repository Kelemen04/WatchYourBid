import { useEffect, useState } from "react";
import type { AuctionItemData } from "../../dto/auction.dto";
import { Link } from "react-router-dom";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useAddToWatchlist } from "../../hooks/useAuctions";

export default function AuctionListItem({
  auction,
}: {
  auction: AuctionItemData;
}) {
  const [timeState, setTimeState] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      // If ended, set timer to zero
      if (auction.status === "ENDED" || auction.status === "CANCELLED") {
        setTimeState({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
        });
        return;
      }

      // Calculating countdown time
      const difference =
        new Date(auction.endTime).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeState({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
        });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeState({
        days: d,
        hours: h,
        minutes: m,
        seconds: s,
        isEnded: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

  const { mutate } = useAddToWatchlist();

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    mutate(
      { auctionId: auction.id },
      {
        onSuccess: () => {
          alert("Added to watchlist!");
        },
        onError: (err) => {
          alert(err.response?.data?.error || "Failed to add to watchlist");
        },
      },
    );
  };

  return (
    <Link to={`/auction/${auction.id}`} className="group block w-full mb-4">
      <div className="w-full bg-white border border-gray-300 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 relative">
        {/* Photo */}
        <div className="w-full md:w-56 h-56 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
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

          <button
            type="button"
            onClick={handleWatchlistClick}
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

        {/* Auction information section */}
        <div className="flex-1 w-0 flex flex-col py-2">
          <div className="truncate">
            <h3 className="font-playfair text-4xl font-bold text-surface mb-3 group-hover:text-primary transition-colors leading-snug truncate">
              {auction.title}
            </h3>
          </div>

          <div className="max-w-[100%]">
            <p className="font-inter text-m text-gray-500 line-clamp-3 leading-relaxed overflow-hidden break-words">
              {auction.description || "No description provided..."}
            </p>
          </div>
        </div>

        {/* Price and time section */}
        <div className="w-full md:w-56 md:border-l border-gray-100 md:pl-6 flex flex-col justify-between items-start md:items-end mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
          <div className="text-left md:text-right w-full">
            <p className="font-inter text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">
              Current Price
            </p>
            <p className="font-inter text-3xl font-extrabold text-surface leading-none">
              €{auction.currentPrice?.toLocaleString()}
            </p>
          </div>

          <div className="w-full mt-6 md:mt-0 flex flex-col items-end">
            <p
              className={`font-inter text-[14px] uppercase font-bold tracking-wider mb-1 ${timeState.isEnded ? "text-red-500" : "text-gray-400"}`}
            >
              {timeState.isEnded ? "Status" : "Ends In"}
            </p>

            {timeState.isEnded ? (
              <div className="flex items-center justify-center w-full h-12 bg-red-50 border border-red-200 rounded-md shadow-sm px-4">
                <span className="font-mono text-[16px] font-bold text-red-500 tracking-widest">
                  ENDED
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2.5">
                {/* Days */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface border border-stone-200 rounded-md shadow-sm">
                  <span className="font-mono text-[15px] font-bold text-[var(--color-primary)] leading-none">
                    {timeState.days}
                  </span>
                  <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                    Days
                  </span>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface border border-stone-200 rounded-md shadow-sm">
                  <span className="font-mono text-[15px] font-bold text-[var(--color-primary)] leading-none">
                    {timeState.hours.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                    Hrs
                  </span>
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface border border-stone-200 rounded-md shadow-sm">
                  <span className="font-mono text-[15px] font-bold text-[var(--color-primary)] leading-none">
                    {timeState.minutes.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                    Min
                  </span>
                </div>

                {/* Seconds */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface border border-stone-200 rounded-md shadow-sm">
                  <span className="font-mono text-[15px] font-bold text-[var(--color-primary)] leading-none">
                    {timeState.seconds.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                    Sec
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
