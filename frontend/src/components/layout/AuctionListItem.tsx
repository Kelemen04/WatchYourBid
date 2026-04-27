import { useEffect, useState } from "react";
import type { AuctionItemData } from "../../dto/auction.dto";

export default function AuctionListItem({
  auction,
}: {
  auction: AuctionItemData;
}) {
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
    <div className="w-full border-2 border-gray-400 bg-white p-4 flex flex-row gap-6 hover:border-black transition-colors">
      <div className="w-48 h-48 bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center relative">
        <span className="text-gray-400 text-xs font-bold uppercase">
          No Image
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase bg-gray-200 px-2 py-0.5">
              {auction.brand}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 uppercase italic leading-none">
            {auction.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {auction.description ||
              "No description provided for this luxury time piece."}
          </p>
        </div>
      </div>

      <div className="w-48 border-l border-gray-200 pl-6 flex flex-col justify-between items-end">
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase text-gray-400">
            Current Price
          </p>
          <p className="text-2xl font-bold">{auction.currentPrice} EUR</p>
        </div>

        <div className="w-full space-y-2">
          <div className="bg-red-50 border border-red-200 p-2 text-center">
            <p className="text-[10px] font-bold uppercase text-red-400 leading-none mb-1">
              Ends in
            </p>
            <p className="text-sm font-mono font-bold text-red-600 leading-none">
              {days + " " + hours + " " + minutes + " " + seconds}
            </p>
          </div>
          <button className="w-full bg-black text-white py-2 text-xs font-bold uppercase hover:bg-gray-800 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
