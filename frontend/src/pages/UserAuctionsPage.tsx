import { Link } from "react-router-dom";
import AuctionListItem from "../components/layout/AuctionListItem";
import { useAuctionDelete, useAuctionsByUser } from "../hooks/useAuctions";

export default function UserAuctionsPage() {
  const { data } = useAuctionsByUser();

  const { mutate: auctionDelete, isPending } = useAuctionDelete();

  const handleDelete = (auctionId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this auction?",
    );

    if (confirmDelete) {
      auctionDelete(auctionId);
    }
  };
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <h1 className="font-playfair text-4xl text-surface mx-20">
            Your auctions:
          </h1>
          <div className="flex flex-col flex-wrap gap-10 mx-25">
            {data?.map((auction) => (
              <div key={auction.id} className="flex flex-col gap-2">
                <AuctionListItem auction={auction} />

                <button
                  type="button"
                  onClick={() => handleDelete(auction.id)}
                  disabled={isPending}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:bg-gray-400 text-center"
                >
                  {isPending ? "Deleting..." : "Delete auction"}
                </button>
                <Link
                  to={`/auction/${auction.id}/update`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center text-xs font-bold rounded-lg transition-colors"
                >
                  UPDATE
                </Link>
              </div>
            ))}

            {data?.length === 0 && (
              <p className="text-gray-500 italic">
                You don't have auctions yet!
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
