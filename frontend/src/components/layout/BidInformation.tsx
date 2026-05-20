import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  PlaceBidSchema,
  type BidDataDTO,
  type PlaceBidDTO,
} from "../../dto/bid.dto";
import { useBidCreate, useBuyNow } from "../../hooks/useBids";
import type { AxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { useAuctionData } from "../../hooks/useAuctions";

export default function BidInformation({ data }: { data: BidDataDTO[] }) {
  const { id } = useParams();
  const auctionId = Number(id);
  const { mutate: placeBid, isPending: isBidPending } = useBidCreate();
  const { mutate: buyNow, isPending: isBuyNowPending } = useBuyNow();

  const { data: auction } = useAuctionData(auctionId);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PlaceBidDTO>({
    resolver: zodResolver(PlaceBidSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: PlaceBidDTO) => {
    placeBid(
      { data, auctionId },
      {
        onError: (err) => {
          const serverError = err as AxiosError<{ error: string }>;
          const msg = serverError?.response?.data?.error;
          setError("root", { type: "server", message: msg });
        },
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
      {buyingPrice && auction.status === "ACTIVE" && (
        <div
          style={{
            borderBottom: "1px dashed silver",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          <p>Ez a termék azonnal is megvásárolható!</p>
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
            Azonnali vétel (Buy Now): {buyingPrice} EUR
          </button>
        </div>
      )}

      {status === "ACTIVE" ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          {auctionType === "ENGLISH" && (
            <>
              <label style={{ fontWeight: "bold" }}>
                Angol aukció - Licitálás
              </label>
              <input
                {...register("bidAmount", { valueAsNumber: true })}
                type="number"
                placeholder={`Minimum: ${(currentPrice || 0) + (minBidIncrement || 0)} EUR`}
                style={{ border: "1px solid black", padding: "5px" }}
              />
              <button
                type="submit"
                disabled={isBidPending}
                style={{ padding: "5px", cursor: "pointer" }}
              >
                {isBidPending ? "Küldés..." : "Licit elküldése"}
              </button>
            </>
          )}

          {auctionType === "DUTCH" && (
            <>
              <label style={{ fontWeight: "bold" }}>
                Holland aukció - Kivásárlás
              </label>
              <p>
                Jelenlegi ketyegő ár, amin elviheted:{" "}
                <span style={{ color: "blue", fontWeight: "bold" }}>
                  {currentPrice} EUR
                </span>
              </p>
              <input
                type="number"
                readOnly
                value={currentPrice}
                {...register("bidAmount", { valueAsNumber: true })}
                style={{ display: "none" }}
              />
              <button
                type="submit"
                disabled={isBidPending}
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >
                {isBidPending
                  ? "Feldolgozás..."
                  : `Megveszem ${currentPrice} EUR-ért`}
              </button>
            </>
          )}

          {auctionType === "JAPANESE" && (
            <>
              <label style={{ fontWeight: "bold" }}>
                Japán aukció - Ár elfogadása
              </label>
              <p>
                Aktuális kör ára:{" "}
                <span style={{ fontWeight: "bold" }}>{currentPrice} EUR</span>
              </p>
              <input
                type="number"
                readOnly
                value={currentPrice}
                {...register("bidAmount", { valueAsNumber: true })}
                style={{ display: "none" }}
              />
              <button
                type="submit"
                disabled={isBidPending}
                style={{
                  backgroundColor: "purple",
                  color: "white",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >
                {isBidPending
                  ? "Mentés..."
                  : "Elfogadom az árat (Bent maradok)"}
              </button>
            </>
          )}

          {(auctionType === "FPSB" || auctionType === "VICKREY") && (
            <>
              <label style={{ fontWeight: "bold" }}>
                {auctionType === "FPSB" ? "Vak licit (FPSB)" : "Vickrey aukció"}{" "}
                - Zárt boríték
              </label>
              <p style={{ fontSize: "12px", color: "gray" }}>
                Az árak rejtettek. Az ajánlat leadása után már nem módosítható.
              </p>
              <input
                {...register("bidAmount", { valueAsNumber: true })}
                type="number"
                placeholder={`Minimum kikiáltási ár: ${startingPrice} EUR`}
                style={{ border: "1px solid black", padding: "5px" }}
              />
              <button
                type="submit"
                disabled={isBidPending}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  padding: "5px",
                  cursor: "pointer",
                }}
              >
                {isBidPending ? "Titkosítás..." : "Titkos ajánlat leadása"}
              </button>
            </>
          )}

          {errors.bidAmount && (
            <p style={{ color: "red", fontSize: "12px", margin: 0 }}>
              Hiba: Érvénytelen összeg!
            </p>
          )}
          {errors.root && (
            <p
              style={{
                color: "darkred",
                fontWeight: "bold",
                fontSize: "13px",
                margin: 0,
              }}
            >
              {errors.root.message}
            </p>
          )}
        </form>
      ) : (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            textAlign: "center",
            fontWeight: "bold",
            color: "red",
          }}
        >
          Az aukció lezárult, további licit leadása nem lehetséges!
        </div>
      )}
      <div
        style={{
          marginTop: "20px",
          borderTop: "1px solid gray",
          paddingTop: "15px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>
          Korábbi licitek ({data?.length || 0})
        </h4>
        {data && data.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {data.map((bid) => (
              <div
                key={bid.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px",
                  backgroundColor: "#fdfdfd",
                  border: "1px solid #eee",
                  fontSize: "14px",
                }}
              >
                <Link
                  to={`/user/${bid.user.id}`}
                  style={{
                    textDecoration: "underline",
                    color: "blue",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {bid.user.firstName} {bid.user.lastName}
                </Link>
                <span style={{ fontWeight: "bold", color: "green" }}>
                  {bid.bidAmount} EUR
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "gray" }}>
            Még nem érkezett licit erre a termékre.
          </p>
        )}
      </div>
    </div>
  );
}
