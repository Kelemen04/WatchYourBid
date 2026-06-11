import { Link, useParams } from "react-router-dom";
import { useAuctionDelete } from "../../hooks/useAuctions";
import { useAuctionPromote } from "../../hooks/useBids";
import { useState } from "react";

export default function AuctionOwnerPanel() {
  const { id } = useParams();
  const auctionId = Number(id);

  const { mutate: deleteAuction, isPending: isDeletePending } =
    useAuctionDelete();
  const { mutate: promoteAuction, isPending: isPromotePending } =
    useAuctionPromote();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this auction? This action cannot be undone.",
      )
    ) {
      deleteAuction(auctionId);
    }
  };

  const handlePromote = () => {
    setServerError(null);
    const amountInput = window.prompt("Enter promotion budget (EUR):");

    if (amountInput === null) return;

    const maxAmount = Number(amountInput);

    if (isNaN(maxAmount) || maxAmount <= 0) {
      alert("Please enter a valid positive number!");
      return;
    }

    promoteAuction(
      { data: { maxAmount }, auctionId },
      {
        onError: (err) => {
          const msg = err.response?.data?.error || "Promotion failed!";
          setServerError(msg);
        },
        onSuccess: () => {
          alert("Auction successfully promoted!");
        },
      },
    );
  };

  return (
    <div className="mb-8 w-full bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="bg-background text-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
          Owner Panel
        </span>
        <span className="text-sm font-medium text-stone-600">
          You are the creator of this auction.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {serverError && (
          <span className="text-red-600 font-bold text-xs mr-2">
            {serverError}
          </span>
        )}

        <Link
          to={`/auction/${auctionId}/update`}
          className="px-6 py-2.5 bg-white border-2 border-stone-200 text-stone-700 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:border-background transition-colors text-center"
        >
          Update
        </Link>

        <button
          onClick={handlePromote}
          disabled={isPromotePending || isDeletePending}
          className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
        >
          {isPromotePending ? "Promoting..." : "Promote"}
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeletePending}
          className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
        >
          {isDeletePending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
