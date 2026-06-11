import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuctionDelete, useGetStaffAuctions } from "../hooks/useAuctions";
import { useCancelAuction } from "../hooks/useModerator";
import type { AuctionTableData } from "../dto/auction.dto";

export default function AllAuctionsList() {
  const [skip, setSkip] = useState(0);
  const take = 10;

  const { data: auctions, isLoading } = useGetStaffAuctions(skip, take);
  const { mutate: cancelAuction } = useCancelAuction();
  const { mutate: deleteAuction } = useAuctionDelete();

  if (isLoading && skip === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading auctions...
        </span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-text-muted/20 pb-2">
        Manage Auctions
      </h2>

      {auctions && auctions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {auctions.map((auction: AuctionTableData) => (
            <Link
              to={`/auction/${auction.id}`}
              key={auction.id}
              className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-text-muted/40 p-4 rounded-xl transition-colors hover:border-primary/50 shadow-sm gap-4 w-full"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-base text-background line-clamp-1 group-hover:text-primary transition-colors">
                  <span className="text-text-muted mr-1">#{auction.id}</span>
                  {auction.title}
                </span>

                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-muted">
                  <span className="uppercase tracking-widest text-[10px]">
                    Price:{" "}
                    <strong className="text-background text-xs">
                      {auction.currentPrice} EUR
                    </strong>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="uppercase tracking-widest text-[10px]">
                    Status:{" "}
                    <strong className="text-background text-xs">
                      {auction.status}
                    </strong>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="uppercase tracking-widest text-[10px]">
                    Owner:{" "}
                    <strong className="text-background text-xs">
                      @{auction.user?.username}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end mt-2 md:mt-0">
                {["ACTIVE", "UPCOMING", "PENDING"].includes(auction.status) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to cancel this auction?",
                        )
                      ) {
                        cancelAuction(auction.id);
                      }
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 border border-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      window.confirm(
                        "Permanently delete this auction? This action cannot be undone.",
                      )
                    ) {
                      deleteAuction(auction.id);
                    }
                  }}
                  className="px-4 py-1.5 bg-red-500 text-white hover:bg-red-700 border border-red-700 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
          <p className="text-text-muted text-lg uppercase tracking-widest">
            No auctions found.
          </p>
        </div>
      )}

      {/* Rögzített szélességű, középre igazított Pagination */}
      {!isLoading && auctions && (
        <div className="mt-8 flex justify-center items-center gap-8">
          <button
            onClick={() => setSkip((p) => Math.max(0, p - take))}
            disabled={skip === 0}
            className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
              skip === 0
                ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                : "border-background text-background hover:bg-background hover:text-white"
            }`}
          >
            &larr; Previous
          </button>

          <span className="font-inter font-bold text-background text-sm uppercase tracking-widest w-20 text-center shrink-0">
            Page {Math.floor(skip / take) + 1}
          </span>

          <button
            onClick={() => setSkip((p) => p + take)}
            disabled={auctions.length < take}
            className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
              auctions.length < take
                ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                : "border-background text-background hover:bg-background hover:text-white"
            }`}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
