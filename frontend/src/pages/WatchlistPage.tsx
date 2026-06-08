import AuctionListItem from "../components/layout/AuctionListItem";
import {
  useRemoveAuctionFromWatchlist,
  useWatchlist,
} from "../hooks/useAuctions";

export default function WatchlistPage() {
  const { data } = useWatchlist();

  const { mutate, isPending } = useRemoveAuctionFromWatchlist();

  const handleDelete = (auctionId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this auction from your watchlist?",
    );

    if (confirmDelete) {
      mutate({ auctionId });
    }
  };
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <h1 className="font-playfair text-4xl text-surface mx-20">
            Watchlist
          </h1>
          <div className="flex flex-col gap-10 mx-25">
            {data?.map((auction) => (
              <div key={auction.id} className="flex flex-col gap-2">
                <AuctionListItem auction={auction} />

                <button
                  type="button"
                  onClick={() => handleDelete(auction.id)}
                  disabled={isPending}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:bg-gray-400 text-center"
                >
                  {isPending ? "Deleting..." : "Delete from watchlist"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
