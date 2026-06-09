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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading pending auctions...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px]">
      <h2 className="font-playfair text-4xl font-bold text-background mb-8 border-b border-text-muted/20 pb-4">
        Auctions to be approved
      </h2>

      {auctions && auctions.length > 0 ? (
        <div className="flex flex-col flex-wrap gap-10">
          {auctions.map((auc: AuctionItemData) => (
            <div key={auc.id} className="flex flex-col gap-2">
              <AuctionListItem auction={auc} />

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() =>
                    window.confirm("Approve this auction?") && approve(auc.id)
                  }
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    window.confirm("Cancel this auction?") && cancel(auc.id)
                  }
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
          <p className="text-text-muted text-lg uppercase tracking-widest">
            No pending auctions found.
          </p>
        </div>
      )}
    </div>
  );
}
