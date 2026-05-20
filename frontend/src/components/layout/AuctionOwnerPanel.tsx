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
    deleteAuction(auctionId);
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
    <>
      <div className="border">
        <Link to={`/auction/${auctionId}/update`}>UPDATE</Link>

        <button
          onClick={handlePromote}
          disabled={isPromotePending || isDeletePending}
          style={{
            backgroundColor: "purple",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isPromotePending ? "Promoting..." : "Promote Auction"}
        </button>

        <button onClick={handleDelete} disabled={isDeletePending}>
          {isDeletePending ? "Deleting auction..." : "Delete auction"}
        </button>
        {serverError && (
          <span style={{ color: "red", fontWeight: "bold", fontSize: "13px" }}>
            Error: {serverError}
          </span>
        )}
      </div>
    </>
  );
}
