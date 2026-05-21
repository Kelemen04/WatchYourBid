import { useState } from "react";
import { useAuctionDelete, useGetStaffAuctions } from "../hooks/useAuctions";
import { useCancelAuction } from "../hooks/useModerator";
import type { AuctionTableData } from "../dto/auction.dto";

export default function AllAuctionsList() {
  const [skip, setSkip] = useState(0);
  const take = 20;

  const { data: auctions, isLoading } = useGetStaffAuctions(skip, take);
  const { mutate: cancelAuction } = useCancelAuction();
  const { mutate: deleteAuction } = useAuctionDelete();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Manage Auctions</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {auctions?.map((auction: AuctionTableData) => (
          <div
            key={auction.id}
            style={{
              border: "1px solid black",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>
                #{auction.id} - {auction.title}
              </strong>
              <p style={{ margin: "5px 0" }}>
                Price: {auction.currentPrice} EUR | Status:{" "}
                <b>{auction.status}</b> | Owner: @{auction.user?.username}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {["ACTIVE", "UPCOMING", "PENDING"].includes(auction.status) && (
                <button
                  onClick={() =>
                    window.confirm("Cancel auction?") &&
                    cancelAuction(auction.id)
                  }
                  style={{ backgroundColor: "orange", color: "white" }}
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() =>
                  window.confirm("Delete permanently?") &&
                  deleteAuction(auction.id)
                }
                style={{ backgroundColor: "red", color: "white" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setSkip((p) => Math.max(0, p - take))}
          disabled={skip === 0}
        >
          Prev
        </button>
        <button onClick={() => setSkip((p) => p + take)}>Next</button>
      </div>
    </div>
  );
}
