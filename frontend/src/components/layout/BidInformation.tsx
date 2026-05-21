import { useState } from "react";
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

export default function BidInformation() {
  const { id } = useParams();
  const auctionId = Number(id);
  const [showAutoBid, setShowAutoBid] = useState(false);

  const { mutate: placeBid, isPending: isBidPending } = useBidCreate();
  const { mutate: autoBid, isPending: isAutoBidPending } = useAutoBidCreate();
  const { mutate: buyNow, isPending: isBuyNowPending } = useBuyNow();
  const { data: bids } = useAuctionBids(auctionId, 10);

  const { data: auction } = useAuctionData(auctionId);

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
        onError: (err) =>
          setBidError("root", {
            type: "server",
            message: (err as AxiosError<{ error: string }>).response?.data
              ?.error,
          }),
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

  if (!auction) return <div>Loading auction forms...</div>;

  const {
    auctionType,
    currentPrice,
    minBidIncrement,
    startingPrice,
    buyingPrice,
    status,
  } = auction;

  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "15px",
        margin: "10px",
        width: "400px",
      }}
    >
      <div style={{ marginBottom: "15px", fontSize: "14px" }}>
        <p>
          Kikiáltási ár: <strong>{startingPrice} EUR</strong>
        </p>
        <p>
          Jelenlegi ár:{" "}
          <strong style={{ color: "blue" }}>{currentPrice} EUR</strong>
        </p>
      </div>

      {buyingPrice && status === "ACTIVE" && (
        <div
          style={{
            borderBottom: "1px dashed silver",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isBidPending || isBuyNowPending}
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Azonnali vétel: {buyingPrice} EUR
          </button>
        </div>
      )}

      {status === "ACTIVE" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {auctionType === "DUTCH" || auctionType === "JAPANESE" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <p>
                Aukció típusa:{" "}
                <strong>{auctionType === "DUTCH" ? "Holland" : "Japán"}</strong>
              </p>
              <button
                type="button"
                disabled={isBidPending}
                onClick={() =>
                  placeBid({ data: { bidAmount: currentPrice }, auctionId })
                }
                style={{
                  backgroundColor: auctionType === "DUTCH" ? "blue" : "purple",
                  color: "white",
                  padding: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {isBidPending
                  ? "Feldolgozás..."
                  : auctionType === "DUTCH"
                    ? `Vásárlás most: ${currentPrice} EUR`
                    : `Ár elfogadása: ${currentPrice} EUR`}
              </button>
            </div>
          ) : auctionType === "ENGLISH" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <form
                onSubmit={handleSubmitBid(onSubmitBid)}
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label style={{ fontWeight: "bold" }}>Licitálás</label>
                <input
                  {...registerBid("bidAmount", { valueAsNumber: true })}
                  type="number"
                  placeholder={`Min: ${(currentPrice || 0) + (minBidIncrement || 0)} EUR`}
                  style={{ border: "1px solid black", padding: "5px" }}
                />
                {bidErrors.bidAmount && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {bidErrors.bidAmount.message}
                  </p>
                )}
                <button type="submit" disabled={isBidPending}>
                  {isBidPending ? "Küldés..." : "Licit elküldése"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowAutoBid(!showAutoBid)}
                style={{ fontSize: "12px", marginTop: "5px" }}
              >
                {showAutoBid ? "Auto-bid elrejtése" : "Auto-bid beállítása"}
              </button>

              {showAutoBid && (
                <form
                  onSubmit={handleSubmitAuto(onSubmitAutoBid)}
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#f9f9f9",
                    border: "1px solid #ccc",
                  }}
                >
                  <input
                    {...registerAuto("maxAmount", { valueAsNumber: true })}
                    type="number"
                    placeholder="Max összeg"
                    style={{ width: "100%", marginBottom: "5px" }}
                  />
                  {autoErrors.maxAmount && (
                    <p style={{ color: "red", fontSize: "12px" }}>
                      {autoErrors.maxAmount.message}
                    </p>
                  )}
                  <input
                    {...registerAuto("increment", { valueAsNumber: true })}
                    type="number"
                    placeholder="Licitlépcső (opcionális)"
                    style={{ width: "100%", marginBottom: "5px" }}
                  />
                  <button
                    type="submit"
                    disabled={isAutoBidPending}
                    style={{ width: "100%" }}
                  >
                    {isAutoBidPending ? "Feldolgozás..." : "Auto-bid indítása"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmitBid(onSubmitBid)}
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={{ fontWeight: "bold" }}>
                Licit beküldése (titkos)
              </label>
              <input
                {...registerBid("bidAmount", { valueAsNumber: true })}
                type="number"
                placeholder="Add meg a licited összegét"
                style={{ border: "1px solid black", padding: "5px" }}
              />
              <button type="submit" disabled={isBidPending}>
                {isBidPending ? "Küldés..." : "Titkos licit beküldése"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            textAlign: "center",
            color: "red",
          }}
        >
          Aukció lezárult!
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          borderTop: "1px solid gray",
          paddingTop: "15px",
        }}
      >
        {(auctionType === "VICKREY" || auctionType === "FPSB") &&
        status === "ACTIVE" ? (
          <p style={{ fontStyle: "italic", color: "gray" }}>
            A licitek titkosak az aukció lezárásáig.
          </p>
        ) : (
          <>
            <h4>Korábbi licitek ({bids?.length || 0})</h4>
            {bids?.map((bid) => (
              <div
                key={bid.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <Link to={`/user/${bid.user.id}`}>
                  {bid.user.firstName} {bid.user.lastName}
                </Link>
                <span>
                  {bid.bidAmount} EUR -{" "}
                  {bid.bidTime
                    ? new Date(bid.bidTime).toLocaleTimeString()
                    : ""}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
