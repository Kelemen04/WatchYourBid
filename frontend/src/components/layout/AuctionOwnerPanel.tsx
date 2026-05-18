import { Link, useParams } from "react-router-dom";
import { useAuctionDelete } from "../../hooks/useAuctions";

export default function AuctionOwnerPanel() {
  const { id } = useParams();
  const auctionId = Number(id);

  const { mutate: deleteAuction, isPending } = useAuctionDelete();

  const handleDelete = () => {
    deleteAuction(auctionId);
  };

  return (
    <>
      <div className="border">
        <Link to={`/auction/${auctionId}/update`}>UPDATE</Link>

        <button onClick={handleDelete} disabled={isPending}>
          {isPending ? "Deleting auction..." : "Delete auction"}
        </button>
      </div>
    </>
  );
}
