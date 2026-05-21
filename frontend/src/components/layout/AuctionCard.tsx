import { useEffect, useState } from "react";
import type { AuctionCardData } from "../../dto/auction.dto";
import { Link } from "react-router-dom";
import { BsBookmark } from "react-icons/bs";
import { useAddToWatchlist } from "../../hooks/useAuctions";
import { socket } from "../../main";
import { useQueryClient } from "@tanstack/react-query";

export default function AuctionCard({ auction }: { auction: AuctionCardData }) {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const handleBidUpdate = (updatedData: {
      auctionId: string | number;
      newPrice: number;
    }) => {
      if (Number(updatedData.auctionId) === Number(auction.id)) {
        queryClient.invalidateQueries({ queryKey: ["homeAuctions"] });
      }
    };

    socket.emit("joinAuction", String(auction.id));
    socket.on("BidUpdated", handleBidUpdate);

    return () => {
      socket.off("BidUpdated", handleBidUpdate);
      socket.emit("leaveAuction", String(auction.id));
    };
  }, [auction.id, queryClient]);

  useEffect(() => {
    const interval = setInterval(() => {
      const difference =
        new Date(auction.endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }
      setDays(Math.floor(difference / (1000 * 60 * 60 * 24)));
      setHours(
        Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      );
      setMinutes(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((difference % (1000 * 60)) / 1000));
    }, 1000);
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
        },
        onError: (err) => {
          alert(err.response?.data?.error || "Failed to add to watchlist");
        },
      },
    );
  };

  return (
    <Link to={`/auction/${auction.id}`}>
      <div className="w-full h-full border-2 border-gray-400 bg-white p-3 flex flex-col gap-2 hover:shadow-md transition-shadow">
        <div className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center relative">
          {auction.images && auction.images.length > 0 ? (
            <img
              src={auction.images[0]}
              alt={auction.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-gray-400 text-xs font-bold uppercase">
              No Image
            </span>
          )}

          <button
            type="button"
            onClick={handleWatchlistClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full border border-gray-300 shadow-sm text-gray-600 hover:text-blue-600 hover:scale-110 transition-all z-10"
            title="Add to watchlist"
          >
            <BsBookmark className="w-4 h-4" />
          </button>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold">
            {auction.brand}
          </p>
          <h3 className="text-sm font-bold truncate leading-tight">
            {auction.title}
          </h3>
        </div>
        <div className="mt-auto border-t border-gray-200 pt-2 flex flex-col gap-1">
          <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase font-bold text-gray-400">
              Current Price
            </span>
            <span className="text-sm font-bold leading-none">
              {auction.currentPrice} EUR
            </span>
          </div>
          <div className="bg-gray-100 p-1 text-center border border-gray-300">
            <span className="text-[10px] font-mono font-bold text-red-600">
              {`${days}d ${hours}h ${minutes}m ${seconds}s`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
