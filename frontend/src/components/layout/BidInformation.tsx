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
import { useQueryClient } from "@tanstack/react-query";
import { useMeData } from "../../hooks/useUser";
import { socket } from "../../main";

const CountdownTimer = ({
  endTime,
  status,
  onTimeUp,
}: {
  endTime: string | Date;
  status: string;
  onTimeUp?: () => void;
}) => {
  const [timeState, setTimeState] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    if (!endTime) return;

    let safeEndString = endTime.toString();
    if (!safeEndString.includes("T")) {
      safeEndString = safeEndString.replace(" ", "T");
    }
    if (!safeEndString.endsWith("Z")) {
      safeEndString += "Z";
    }

    const endMs = new Date(safeEndString).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = endMs - now;

      if (difference <= 0 || status === "ENDED" || status === "CANCELLED") {
        setTimeState((prev) => {
          if (
            !prev.isEnded &&
            status !== "ENDED" &&
            status !== "CANCELLED" &&
            onTimeUp
          ) {
            onTimeUp();
          }
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
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
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [endTime, status, onTimeUp]);

  if (timeState.isEnded) {
    return (
      <div className="flex items-center justify-center h-8 bg-red-50 border border-red-200 rounded px-3">
        <span className="font-mono text-sm font-bold text-red-500 tracking-widest">
          ENDED
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {timeState.days > 0 && (
        <div className="flex flex-col items-center justify-center w-10 h-12 bg-white border border-stone-200 rounded shadow-sm">
          <span className="font-mono text-[18px] font-bold text-primary leading-none">
            {timeState.days}
          </span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
            D
          </span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center w-10 h-12 bg-white border border-stone-200 rounded shadow-sm">
        <span className="font-mono text-[18px] font-bold text-primary leading-none">
          {timeState.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
          H
        </span>
      </div>
      <div className="flex flex-col items-center justify-center w-10 h-12 bg-white border border-stone-200 rounded shadow-sm">
        <span className="font-mono text-[18px] font-bold text-primary leading-none">
          {timeState.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
          M
        </span>
      </div>
      <div className="flex flex-col items-center justify-center w-10 h-12 bg-white border border-stone-200 rounded shadow-sm">
        <span className="font-mono text-[18px] font-bold text-primary leading-none">
          {timeState.seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
          S
        </span>
      </div>
    </div>
  );
};

// MAIN COMPONENT
export default function BidInformation() {
  const { id } = useParams();
  const auctionId = Number(id);
  const queryClient = useQueryClient();
  const [showAutoBid, setShowAutoBid] = useState(false);

  const [localSecretBidPlaced, setLocalSecretBidPlaced] = useState(false);

  const { data: user } = useMeData();
  const currentUserId = user?.id;

  const { mutate: placeBid, isPending: isBidPending } = useBidCreate();
  const { mutate: autoBid, isPending: isAutoBidPending } = useAutoBidCreate();
  const { mutate: buyNow, isPending: isBuyNowPending } = useBuyNow();

  const { data: bids, refetch: refetchBids } = useAuctionBids(auctionId, 10);
  const { data: auction, refetch: refetchAuction } = useAuctionData(auctionId);

  // SOCKET.IO
  useEffect(() => {
    if (!auctionId) return;

    socket.emit("joinAuction", auctionId);

    const handleUpdate = () => {
      queryClient.invalidateQueries({
        queryKey: ["auctionDetails", auctionId],
      });
      queryClient.invalidateQueries({ queryKey: ["bids", auctionId] });
    };

    socket.on("BidUpdated", handleUpdate);
    socket.on("AuctionEnded", handleUpdate);

    return () => {
      socket.emit("leaveAuction", auctionId);
      socket.off("BidUpdated", handleUpdate);
      socket.off("AuctionEnded", handleUpdate);
    };
  }, [auctionId, queryClient]);

  /*useEffect(() => {
    if (!auction || auction.status !== "ACTIVE") return;

    if (auction.auctionType === "DUTCH" || auction.auctionType === "JAPANESE") {
      const timer = setInterval(() => {
        refetchAuction();
        refetchBids();
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [auction?.status, auction?.auctionType, refetchAuction, refetchBids]);*/

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

  const onSubmitBid = (data: PlaceBidDTO) => {
    placeBid(
      { data, auctionId },
      {
        onSuccess: () => {
          if (
            auction?.auctionType === "VICKREY" ||
            auction?.auctionType === "FPSB"
          ) {
            setLocalSecretBidPlaced(true);
          }
        },
        onError: (err) => {
          const errorMsg = (err as AxiosError<{ error: string }>).response?.data
            ?.error;

          if (
            errorMsg &&
            (errorMsg.includes("already submitted") ||
              errorMsg.includes("already bid"))
          ) {
            setLocalSecretBidPlaced(true);
          } else {
            setBidError("root", {
              type: "server",
              message: errorMsg || "An error occurred.",
            });
          }
        },
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
      <div className="flex items-center justify-center p-12 text-stone-600 text-sm font-inter border border-stone-100 shadow-sm bg-white">
        <span className="size-5 rounded-full border-2 border-stone-200 border-t-primary animate-spin mr-3" />
        Loading auction details...
      </div>
    );

  const {
    auctionType,
    minBidIncrement,
    startingPrice,
    buyingPrice,
    status,
    userId: auctionOwnerId,
  } = auction;

  const isActive = status === "ACTIVE";

  const isMyAuction = Boolean(
    currentUserId && auctionOwnerId && currentUserId === auctionOwnerId,
  );

  const isHighestBidder = Boolean(
    bids && bids.length > 0 && bids[0].user.id === currentUserId,
  );

  const myBids = bids?.filter((b) => b.user.id === currentUserId) || [];
  const myMaxBid =
    myBids.length > 0 ? Math.max(...myBids.map((b) => b.bidAmount)) : null;

  const hasAcceptedCurrentPrice = myMaxBid === auction.currentPrice;

  let isOutJapanese = false;
  if (auctionType === "JAPANESE" && auction.currentPrice > startingPrice) {
    if (myMaxBid === null) {
      isOutJapanese = true;
    } else if (myMaxBid < auction.currentPrice - (auction.moneyInterval || 0)) {
      isOutJapanese = true;
    }
  }

  const hasSecretBid =
    localSecretBidPlaced ||
    Boolean(bids?.some((b) => b.user.id === currentUserId));

  const auctionTypeLabel: Record<string, string> = {
    DUTCH: "Dutch Auction",
    JAPANESE: "Japanese Auction",
    ENGLISH: "English Auction",
    VICKREY: "Vickrey Auction",
    FPSB: "First-Price Sealed-Bid",
  };

  return (
    <div className="w-full max-w-[420px] bg-white border border-stone-200 font-inter shadow-md relative overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-80" />

      {/* Header: Type and Countdown*/}
      <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/50 mt-1">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-stone-500">
            Auction Type
          </span>
          <span className="text-[15px] font-medium text-surface tracking-wide">
            {auctionTypeLabel[auctionType] ?? auctionType}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-stone-500">
            Time Remaining
          </span>
          <div className="flex items-center gap-3">
            <CountdownTimer
              endTime={auction.endTime}
              status={auction.status}
              onTimeUp={() => {
                refetchAuction();
                refetchBids();
              }}
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-6 py-6 border-b border-stone-100 flex flex-col gap-4">
        {auctionType === "VICKREY" || auctionType === "FPSB" ? (
          <div className="flex items-center justify-center py-2">
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-stone-400">
              Prices are hidden
            </span>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-1">
                Current Price
              </span>
              <span className="font-inter text-4xl font-semibold text-primary tracking-tight transition-all duration-500">
                {auction.currentPrice.toLocaleString("en-US")}
                <span className="font-playfair text-sm font-bold text-stone-500 ml-2 uppercase tracking-widest">
                  Eur
                </span>
              </span>
            </div>
            <div className="flex flex-col items-end pb-1">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-1">
                Starting Price
              </span>
              <span className="font-inter text-lg text-stone-600">
                {startingPrice.toLocaleString("en-US")}
                <span className="font-playfair text-sm font-bold text-stone-500 ml-2 uppercase tracking-widest">
                  Eur
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bidding Forms */}
      <div className="px-6 py-6 flex flex-col gap-5">
        {isMyAuction && (
          <div className="w-full bg-stone-100 text-stone-500 px-5 py-4 text-center text-[11px] font-bold tracking-[0.2em] uppercase border border-stone-200">
            This is your auction. You cannot bid on it.
          </div>
        )}

        {/* Buy Now Option */}
        {buyingPrice && isActive && (
          <div className="pb-5 border-b border-stone-100">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={
                isBidPending ||
                isBuyNowPending ||
                isHighestBidder ||
                isMyAuction
              }
              className="group w-full flex items-center justify-between bg-white text-surface border border-stone-200 px-5 py-3.5 cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[11px] font-inter font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-primary">
                Buy Now
              </span>
              <span className="font-inter text-lg font-semibold transition-colors group-hover:text-primary">
                {buyingPrice.toLocaleString("en-US")}
                <span className="font-playfair text-sm font-bold text-background ml-2 uppercase tracking-widest group-hover:text-primary">
                  Eur
                </span>
              </span>
            </button>
          </div>
        )}

        {isActive ? (
          <>
            {/* DUTCH / JAPANeSE */}
            {(auctionType === "DUTCH" || auctionType === "JAPANESE") && (
              <>
                {auctionType === "JAPANESE" && isOutJapanese ? (
                  <div className="w-full bg-stone-100 text-stone-400 px-5 py-4 text-center text-[11px] font-bold tracking-[0.2em] uppercase border border-stone-200">
                    You are no longer in this auction
                  </div>
                ) : auctionType === "JAPANESE" && hasAcceptedCurrentPrice ? (
                  <div className="w-full bg-primary/10 text-primary px-5 py-4 text-center text-[11px] font-bold tracking-[0.2em] uppercase border border-primary/20">
                    Price Accepted. Waiting for others...
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isBidPending || isMyAuction}
                    onClick={() =>
                      placeBid(
                        {
                          data: { bidAmount: auction.currentPrice },
                          auctionId,
                        },
                        {
                          onSuccess: () => {
                            refetchAuction();
                            refetchBids();
                          },
                        },
                      )
                    }
                    className="w-full bg-surface text-white px-5 py-4 cursor-pointer transition-all duration-300 hover:bg-stone-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1.5"
                  >
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">
                      {auctionType === "DUTCH"
                        ? "Buy at this price"
                        : "Accept current price"}
                    </span>
                    <span className="font-inter text-xl font-semibold tracking-wide transition-all duration-500">
                      {isBidPending
                        ? "Processing..."
                        : `${auction.currentPrice.toLocaleString("en-US")} EUR`}
                    </span>
                  </button>
                )}
              </>
            )}

            {/* ENGLISH */}
            {auctionType === "ENGLISH" && (
              <div className="flex flex-col gap-4">
                <form
                  onSubmit={handleSubmitBid(onSubmitBid)}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    {isHighestBidder && !isMyAuction && (
                      <div className="py-2.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold tracking-[0.15em] uppercase text-center mb-1">
                        You hold the highest bid!
                      </div>
                    )}
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-600">
                      Your Bid Amount
                    </label>
                    <input
                      {...registerBid("bidAmount", { valueAsNumber: true })}
                      type="number"
                      placeholder={`Min. ${(auction.currentPrice + (minBidIncrement || 0)).toLocaleString("en-US")} EUR`}
                      disabled={isHighestBidder || isMyAuction}
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 font-inter text-lg text-surface placeholder:font-inter placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-primary focus:bg-white transition-all duration-300 disabled:opacity-50 disabled:bg-stone-100"
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
                    disabled={isBidPending || isHighestBidder || isMyAuction}
                    className="w-full py-4 bg-primary text-white text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBidPending
                      ? "Processing..."
                      : isHighestBidder
                        ? "Currently Winning"
                        : "Place Bid"}
                  </button>
                </form>

                {!isMyAuction && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAutoBid(!showAutoBid)}
                      className="w-full py-3 bg-transparent border border-stone-200 text-[10px] font-bold tracking-[0.15em] uppercase text-stone-600 cursor-pointer transition-colors hover:border-primary hover:text-primary flex items-center justify-center gap-2"
                    >
                      <span
                        className={`text-sm transition-transform duration-300 ${showAutoBid ? "rotate-45" : ""}`}
                      >
                        +
                      </span>
                      {showAutoBid ? "Hide Auto-bid" : "Set up Auto-bid"}
                    </button>

                    {showAutoBid && (
                      <form
                        onSubmit={handleSubmitAuto(onSubmitAutoBid)}
                        className="flex flex-col gap-4 p-5 bg-stone-50 border border-stone-200 transition-all"
                      >
                        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-surface mb-1">
                          Auto-bid Settings
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-stone-600">
                            Maximum Amount
                          </label>
                          <input
                            {...registerAuto("maxAmount", {
                              valueAsNumber: true,
                            })}
                            type="number"
                            placeholder="e.g. 5000 EUR"
                            className="w-full px-3.5 py-3 bg-white border border-stone-200 font-inter text-base text-surface placeholder:font-inter placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-primary transition-colors"
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
                            {...registerAuto("increment", {
                              valueAsNumber: true,
                            })}
                            type="number"
                            placeholder="e.g. 100 EUR"
                            className="w-full px-3.5 py-3 bg-white border border-stone-200 font-inter text-base text-surface placeholder:font-inter placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-primary transition-colors"
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
                          className="w-full py-3.5 mt-2 bg-surface text-white text-[10px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-colors hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAutoBidPending ? "Processing..." : "Activate"}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            {/* VICKREY / FPSB */}
            {(auctionType === "VICKREY" || auctionType === "FPSB") && (
              <>
                {hasSecretBid && !isMyAuction ? (
                  <div className="w-full bg-primary/10 text-primary px-5 py-4 text-center text-[11px] font-bold tracking-[0.2em] uppercase border border-primary/20">
                    You have already placed your secret bid
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmitBid(onSubmitBid)}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-600 flex items-center gap-1.5">
                        Secret Bid
                      </label>
                      <input
                        {...registerBid("bidAmount", { valueAsNumber: true })}
                        type="number"
                        disabled={isMyAuction || isBidPending}
                        placeholder="Enter your secret bid amount"
                        className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 font-inter text-lg text-surface placeholder:font-inter placeholder:text-sm placeholder:text-stone-500 outline-none focus:border-primary focus:bg-white transition-colors duration-300 disabled:opacity-50 disabled:bg-stone-100"
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
                      disabled={isBidPending || isMyAuction}
                      className="w-full py-4 bg-surface text-white text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:bg-stone-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBidPending ? "Sending..." : "Place Secret Bid"}
                    </button>
                  </form>
                )}
              </>
            )}
          </>
        ) : (
          <div className="py-6 px-6 text-center bg-stone-50 border border-stone-200 rounded-sm flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-stone-600">
              This auction has ended
            </span>

            {/* Winners */}
            {bids && bids.length > 0 && bids[0].isWinner ? (
              <span className="text-sm font-medium text-primary">
                Winner: {bids[0].user.firstName} {bids[0].user.lastName}
                <br />
                Final Price: {bids[0].bidAmount.toLocaleString("en-US")} EUR
              </span>
            ) : (
              <span className="text-sm font-medium text-red-500">
                No winner (Reserve price not met or no bids placed)
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Bids History ── */}
      <div className="border-t border-stone-200 bg-stone-50/50">
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-surface">
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
                    className="text-[13px] font-medium text-surface hover:text-primary transition-colors truncate max-w-[150px]"
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
                      className={`font-playfair text-[15px] font-semibold whitespace-nowrap ${
                        index === 0 ? "text-primary" : "text-stone-600"
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
