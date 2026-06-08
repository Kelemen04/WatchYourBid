import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useBidCreate, useBuyNow, useAutoBidCreate } from "../../hooks/useBids";
import {
  PlaceBidSchema,
  AutoBidSchema,
  type PlaceBidDTO,
  type AutoBidDTO,
} from "../../dto/bid.dto";
import { Link, useParams } from "react-router-dom";
import { useAuctionData } from "../../hooks/useAuctions";
import { useAuctionBids } from "../../hooks/useBids";

export default function BidInformation() {
  const { id } = useParams();
  const auctionId = Number(id);
  const [showAutoBid, setShowAutoBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { mutate: placeBid, isPending: isBidPending } = useBidCreate();
  const { mutate: autoBid, isPending: isAutoBidPending } = useAutoBidCreate();
  const { mutate: buyNow, isPending: isBuyNowPending } = useBuyNow();
  const { data: bids } = useAuctionBids(auctionId, 10);
  const { data: auction } = useAuctionData(auctionId);

  const {
    register: registerBid,
    handleSubmit: handleSubmitBid,
    setError: setBidError,
    formState: { errors: bidErrors },
  } = useForm<PlaceBidDTO>({ resolver: zodResolver(PlaceBidSchema) });

  const {
    register: registerAuto,
    handleSubmit: handleSubmitAuto,
    setError: setAutoError,
    formState: { errors: autoErrors },
  } = useForm<AutoBidDTO>({ resolver: zodResolver(AutoBidSchema) });

  // Countdown Timer Logic
  useEffect(() => {
    if (!auction?.endTime) return;

    const calculateTimeLeft = () => {
      const difference =
        new Date(auction.endTime).getTime() - new Date().getTime();

      if (
        difference <= 0 ||
        auction.status === "ENDED" ||
        auction.status === "CANCELLED"
      ) {
        setTimeLeft("Ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auction?.endTime, auction?.status]);

  const onSubmitBid = (data: PlaceBidDTO) => {
    placeBid(
      { data, auctionId },
      {
        onError: (err) =>
          setBidError("root", {
            type: "server",
            message: (err as AxiosError<{ error: string }>).response?.data
              ?.error,
          }),
      },
    );
  };

  const onSubmitAutoBid = (data: AutoBidDTO) => {
    autoBid(
      { data, auctionId },
      {
        onError: (err) =>
          setAutoError("root", {
            type: "server",
            message: (err as AxiosError<{ error: string }>).response?.data
              ?.error,
          }),
      },
    );
  };

  const handleBuyNow = () => {
    if (!auction?.buyingPrice) return;
    buyNow({ auctionId });
  };

  if (!auction)
    return (
      <div className="flex items-center justify-center p-12 text-stone-600 text-sm font-[var(--font-inter)] border border-stone-100 shadow-sm bg-white">
        <span className="size-5 rounded-full border-2 border-stone-200 border-t-[var(--color-primary)] animate-spin mr-3" />
        Loading auction details...
      </div>
    );

  const {
    auctionType,
    currentPrice,
    minBidIncrement,
    startingPrice,
    buyingPrice,
    status,
  } = auction;

  const auctionTypeLabel: Record<string, string> = {
    DUTCH: "Dutch Auction",
    JAPANESE: "Japanese Auction",
    ENGLISH: "English Auction",
    VICKREY: "Vickrey Auction",
    FPSB: "First-Price Sealed-Bid",
  };

  const isActive = status === "ACTIVE";

  return (
    <div className="w-full max-w-[420px] bg-white border border-stone-200 font-[var(--font-inter)] shadow-md relative overflow-hidden">
      {/* ── Top Accent Line ── */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)] opacity-80" />

      {/* ── Header: Type and Countdown ── */}
      <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 mt-1">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-500">
            Auction Type
          </span>
          <span className="text-[13px] font-medium text-[var(--color-surface)] tracking-wide">
            {auctionTypeLabel[auctionType] ?? auctionType}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-500">
            Time Remaining
          </span>
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
              </span>
            )}
            <span
              className={`font-[var(--font-playfair)] font-semibold text-base ${
                isActive ? "text-[var(--color-surface)]" : "text-stone-500"
              }`}
            >
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* ── Pricing Section ── */}
      <div className="px-6 py-6 border-b border-stone-100 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-1">
              Current Price
            </span>
            <span className="font-[var(--font-playfair)] text-4xl font-semibold text-[var(--color-primary)] tracking-tight">
              {currentPrice.toLocaleString("en-US")}
              <span className="font-[var(--font-inter)] text-sm font-medium text-stone-500 ml-2 uppercase tracking-widest">
                Eur
              </span>
            </span>
          </div>
          <div className="flex flex-col items-end pb-1">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-1">
              Starting Price
            </span>
            <span className="font-[var(--font-playfair)] text-lg text-stone-600">
              {startingPrice.toLocaleString("en-US")} EUR
            </span>
          </div>
        </div>
      </div>

      {/* ── Bidding Forms (Body) ── */}
      <div className="px-6 py-6 flex flex-col gap-5">
        {/* Buy Now Option */}
        {buyingPrice && isActive && (
          <div className="pb-5 border-b border-stone-100">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isBidPending || isBuyNowPending}
              className="group w-full flex items-center justify-between bg-white text-[var(--color-surface)] border border-stone-200 px-5 py-3.5 cursor-pointer transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-[var(--color-primary)]">
                Buy Now
              </span>
              <span className="font-[var(--font-playfair)] text-lg font-semibold transition-colors group-hover:text-[var(--color-primary)]">
                {buyingPrice.toLocaleString("en-US")} EUR
              </span>
            </button>
          </div>
        )}

        {isActive ? (
          <>
            {/* Dutch / Japanese: One-click acceptance */}
            {(auctionType === "DUTCH" || auctionType === "JAPANESE") && (
              <button
                type="button"
                disabled={isBidPending}
                onClick={() =>
                  placeBid({ data: { bidAmount: currentPrice }, auctionId })
                }
                className="w-full bg-[var(--color-surface)] text-white px-5 py-4 cursor-pointer transition-all duration-300 hover:bg-stone-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1.5"
              >
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">
                  {auctionType === "DUTCH"
                    ? "Buy at this price"
                    : "Accept current price"}
                </span>
                <span className="font-[var(--font-playfair)] text-xl font-semibold tracking-wide">
                  {isBidPending
                    ? "Processing..."
                    : `${currentPrice.toLocaleString("en-US")} EUR`}
                </span>
              </button>
            )}

            {/* English Auction Form */}
            {auctionType === "ENGLISH" && (
              <div className="flex flex-col gap-4">
                <form
                  onSubmit={handleSubmitBid(onSubmitBid)}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-600">
                      Your Bid Amount
                    </label>
                    <input
                      {...registerBid("bidAmount", { valueAsNumber: true })}
                      type="number"
                      placeholder={`Min. ${(currentPrice + (minBidIncrement || 0)).toLocaleString("en-US")} EUR`}
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 font-[var(--font-playfair)] text-lg text-[var(--color-surface)] placeholder:font-[var(--font-inter)] placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all duration-300"
                    />
                    {bidErrors.bidAmount && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">
                        {bidErrors.bidAmount.message}
                      </p>
                    )}
                    {bidErrors.root && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">
                        {bidErrors.root.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isBidPending}
                    className="w-full py-4 bg-[var(--color-primary)] text-white text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBidPending ? "Processing..." : "Place Bid"}
                  </button>
                </form>

                {/* Auto-bid Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAutoBid(!showAutoBid)}
                  className="w-full py-3 bg-transparent border border-stone-200 text-[10px] font-bold tracking-[0.15em] uppercase text-stone-600 cursor-pointer transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] flex items-center justify-center gap-2"
                >
                  <span
                    className={`text-sm transition-transform duration-300 ${showAutoBid ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                  {showAutoBid ? "Hide Auto-bid" : "Set up Auto-bid"}
                </button>

                {/* Auto-bid Form */}
                {showAutoBid && (
                  <form
                    onSubmit={handleSubmitAuto(onSubmitAutoBid)}
                    className="flex flex-col gap-4 p-5 bg-stone-50 border border-stone-200 transition-all"
                  >
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-surface)] mb-1">
                      Auto-bid Settings
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-stone-600">
                        Maximum Amount
                      </label>
                      <input
                        {...registerAuto("maxAmount", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 5000 EUR"
                        className="w-full px-3.5 py-3 bg-white border border-stone-200 font-[var(--font-playfair)] text-base text-[var(--color-surface)] placeholder:font-[var(--font-inter)] placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                      {autoErrors.maxAmount && (
                        <p className="text-[11px] text-red-600 font-medium">
                          {autoErrors.maxAmount.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-stone-600">
                        Bid Increment{" "}
                        <span className="normal-case opacity-80 tracking-normal text-stone-500">
                          (Optional)
                        </span>
                      </label>
                      <input
                        {...registerAuto("increment", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 100 EUR"
                        className="w-full px-3.5 py-3 bg-white border border-stone-200 font-[var(--font-playfair)] text-base text-[var(--color-surface)] placeholder:font-[var(--font-inter)] placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                    {autoErrors.root && (
                      <p className="text-[11px] text-red-600 font-medium">
                        {autoErrors.root.message}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isAutoBidPending}
                      className="w-full py-3.5 mt-2 bg-[var(--color-surface)] text-white text-[10px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-colors hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAutoBidPending ? "Processing..." : "Activate"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Vickrey / FPSB: Secret Bid Form */}
            {(auctionType === "VICKREY" || auctionType === "FPSB") && (
              <form
                onSubmit={handleSubmitBid(onSubmitBid)}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-600 flex items-center gap-1.5">
                    <span className="text-sm">🔒</span> Secret Bid
                  </label>
                  <input
                    {...registerBid("bidAmount", { valueAsNumber: true })}
                    type="number"
                    placeholder="Enter your secret bid amount"
                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 font-[var(--font-playfair)] text-lg text-[var(--color-surface)] placeholder:font-[var(--font-inter)] placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-colors duration-300"
                  />
                  {bidErrors.bidAmount && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {bidErrors.bidAmount.message}
                    </p>
                  )}
                  {bidErrors.root && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {bidErrors.root.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isBidPending}
                  className="w-full py-4 bg-[var(--color-surface)] text-white text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:bg-stone-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBidPending ? "Sending..." : "Place Secret Bid"}
                </button>
              </form>
            )}
          </>
        ) : (
          /* Closed State */
          <div className="py-6 text-center bg-stone-50 border border-stone-200 rounded-sm">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-stone-600">
              This auction has ended
            </span>
          </div>
        )}
      </div>

      {/* ── Bid History ── */}
      <div className="border-t border-stone-200 bg-stone-50/50">
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-surface)]">
            Bid History
          </span>
          <span className="text-[10px] font-bold bg-white border border-stone-200 text-stone-600 px-2.5 py-0.5 rounded-full shadow-sm">
            {bids?.length ?? 0}
          </span>
        </div>

        <div className="px-6 py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {(auctionType === "VICKREY" || auctionType === "FPSB") && isActive ? (
            <div className="py-8 text-center text-[12px] text-stone-600 italic font-medium">
              Bids are hidden until the auction closes.
            </div>
          ) : bids && bids.length > 0 ? (
            <div className="flex flex-col">
              {bids.map((bid, index) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between py-3.5 border-b border-stone-200/60 last:border-0"
                >
                  <Link
                    to={`/user/${bid.user.id}`}
                    className="text-[13px] font-medium text-[var(--color-surface)] hover:text-[var(--color-primary)] transition-colors truncate max-w-[150px]"
                  >
                    {bid.user.firstName} {bid.user.lastName}
                  </Link>
                  <div className="flex items-center gap-4 shrink-0">
                    {bid.bidTime && (
                      <span className="text-[11px] text-stone-500 tracking-wide">
                        {new Date(bid.bidTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    <span
                      className={`font-[var(--font-playfair)] text-[15px] font-semibold whitespace-nowrap ${
                        index === 0
                          ? "text-[var(--color-primary)]"
                          : "text-stone-600"
                      }`}
                    >
                      {bid.bidAmount.toLocaleString("en-US")} EUR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-stone-500 text-center py-8 font-medium">
              No bids yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
