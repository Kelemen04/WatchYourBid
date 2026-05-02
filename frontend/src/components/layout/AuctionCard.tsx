import { useEffect, useState } from "react";
import type { AuctionCardData } from "../../dto/auction.dto";
import { Link } from "react-router-dom";

export default function AuctionCard({ auction }: { auction: AuctionCardData }) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const end = new Date(auction.endTime);
      const now = new Date();

      const difference = end.getTime() - now.getTime();

      if (difference <= 0) {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        clearInterval(interval);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      setDays(d);

      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      setHours(h);

      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      setMinutes(m);

      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setSeconds(s);
    }, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime]);

  return (
    <Link to={`/auction/${auction.id}`}>
      <div className="w-full border-2 border-gray-400 bg-white p-3 flex flex-col gap-2 hover:shadow-md transition-shadow">
        <div className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center relative">
          <span className="text-gray-400 text-xs font-bold uppercase">
            No Image
          </span>
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
              {days + " " + hours + " " + minutes + " " + seconds}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
