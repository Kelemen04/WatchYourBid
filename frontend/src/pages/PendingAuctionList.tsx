import type { AuctionItemData } from "../dto/auction.dto";
import {
  useGetPendingAuctions,
  useApproveAuction,
  useCancelAuction,
} from "../hooks/useModerator";
import AuctionListItem from "../components/layout/AuctionListItem";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../api/axios";
import { useEffect } from "react";

export default function PendingAuctionsList() {
  const navigate = useNavigate();
  const myRole = getUserRole();

  const { data: auctions, isLoading } = useGetPendingAuctions();
  const { mutate: approve } = useApproveAuction();
  const { mutate: cancel } = useCancelAuction();

  const isStaff =
    myRole === "ADMIN" || myRole === "MODERATOR" || myRole === "SUPER_ADMIN";

  useEffect(() => {
    if (!isStaff) {
      navigate("/dashboard");
    }
  }, [isStaff, navigate]);

  if (!isStaff) return null;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Auctions to be approved</h2>

      {auctions && auctions.length > 0 ? (
        auctions.map((auc: AuctionItemData) => (
          <div key={auc.id} className="mb-8">
            <AuctionListItem auction={auc} />

            <div className="flex gap-4 mt-4 p-4 border-b border-x border-gray-400 bg-gray-50">
              <button
                onClick={() => approve(auc.id)}
                className="bg-green-600 text-white px-6 py-2 font-bold uppercase text-sm hover:bg-green-700 transition"
              >
                Approve
              </button>
              <button
                onClick={() => cancel(auc.id)}
                className="bg-red-600 text-white px-6 py-2 font-bold uppercase text-sm hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No pending auctions found.</p>
      )}
    </div>
  );
}
