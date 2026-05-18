import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlaceBidSchema, type PlaceBidDTO } from "../../dto/bid.dto";
import { useBidCreate, useBuyNow } from "../../hooks/useBids";
import type { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import { useAuctionData } from "../../hooks/useAuctions";

export default function BidInformation() {
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
              {isBidPending ? "Mentés..." : "Elfogadom az árat (Bent maradok)"}
            </button>
          </>
        )}

        {auctionType === "FPSB" && (
          <>
            <label style={{ fontWeight: "bold" }}>
              Vak licit (FPSB) - Zárt boríték
            </label>
            <p style={{ fontSize: "12px", color: "gray" }}>
              Az árak rejtettek. A legmagasabb ajánlat nyer, és a saját árát
              fizeti.
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

        {auctionType === "VICKREY" && (
          <>
            <label style={{ fontWeight: "bold" }}>
              Vickrey aukció - Zárt boríték
            </label>
            <p style={{ fontSize: "12px", color: "gray" }}>
              Az árak rejtettek. A legmagasabb ajánlat nyer, de a második
              legmagasabb árat fizeti.
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
    </div>
  );
}
