import { useParams, Link } from "react-router-dom"; // <-- Link import hozzáadva
import { socket } from "../../main";
import { useEffect, useState } from "react";
import type { AuctionFullData } from "../../dto/auction.dto";
import { usePublicProfile } from "../../hooks/useUser"; // <-- ÚJ IMPORT

interface AuctionInformationProps {
  data: AuctionFullData | undefined;
}

// Segédkomponens egy adatmező kiírására
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => (
  <div className="flex flex-col py-3 border-b border-stone-100">
    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-1">
      {label}
    </span>
    <span className="text-sm font-medium text-[var(--color-surface)]">
      {value || "N/A"}
    </span>
  </div>
);

export default function AuctionInformation({ data }: AuctionInformationProps) {
  const { id } = useParams();

  // --- ÚJ: Lekérjük az eladó (owner) adatait ---
  const { data: sellerProfile, isLoading: isSellerLoading } = usePublicProfile(
    data?.userId as number,
    { enabled: !!data?.userId }, // Csak akkor fut le, ha már betöltött az aukció!
  );

  const images = data?.images?.length
    ? data.images
    : ["/placeholder-watch.png"];
  const [activeImage, setActiveImage] = useState(images[0]);

  useEffect(() => {
    if (images.length > 0) {
      const timeoutId = setTimeout(() => {
        setActiveImage(images[0]);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [data]);

  useEffect(() => {
    if (!id) return;
    socket.emit("joinAuction", id);

    const handleBidUpdate = (updatedData: unknown) => {
      console.log("New bid: ", updatedData);
    };

    socket.on("BidUpdated", handleBidUpdate);

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("BidUpdated", handleBidUpdate);
    };
  }, [id]);

  if (!data) return null;

  return (
    <div className="flex flex-col gap-10 bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm">
      {/* ── KÉPGALÉRIA ── */}
      <div className="flex flex-col gap-4">
        <div className="w-full aspect-[4/3] bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative group cursor-crosshair">
          <img
            src={activeImage}
            alt={data.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-300">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img
                    ? "border-[var(--color-primary)] opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CÍM ÉS LEÍRÁS ── */}
      <div className="border-b border-stone-100 pb-8">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-background tracking-tight mb-4">
          {data.title}
        </h1>
        <p className="font-inter text-stone-600 leading-relaxed whitespace-pre-line text-[15px]">
          {data.description}
        </p>
      </div>

      {/* ── ELADÓ (TULAJDONOS) ADATAI ── */}
      {data.userId && (
        <div className="flex items-center gap-5 pb-8 border-b border-stone-100">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100 border-2 border-[var(--color-primary)] shrink-0">
            <img
              src={sellerProfile?.profilePicture || "/default-avatar.png"}
              alt="Seller Avatar"
              className={`w-full h-full object-cover ${isSellerLoading ? "animate-pulse" : ""}`}
            />
          </div>

          <div className="flex flex-col flex-1 gap-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500">
              Owner
            </span>

            {isSellerLoading ? (
              <div className="h-5 w-32 bg-stone-200 animate-pulse rounded"></div>
            ) : (
              // Itt egy divbe tettük a nevet és a ratinget, hogy egymás mellé kerüljenek
              <div className="flex items-center justify-between w-full">
                <Link
                  to={`/user/${data.userId}`}
                  className="font-playfair text-xl font-bold text-surface hover:text-primary transition-colors"
                >
                  {sellerProfile?.firstName} {sellerProfile?.lastName}
                </Link>

                {/* Rating a jobb oldalon */}
                {sellerProfile && (
                  <div className="flex items-center gap-2 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                    <span className="text-2xl font-bold text-stone-700">
                      {sellerProfile.seller?.rating?.toFixed(1) || "0.0"} / 5.0
                    </span>
                    <span className="text-yellow-400 text-2xl">★</span>
                  </div>
                )}
              </div>
            )}

            {!isSellerLoading && sellerProfile && (
              <span className="text-[12px] font-medium text-stone-500">
                @{sellerProfile.username}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── SPECIFIKÁCIÓK ── */}
      <div>
        <h3 className="font-playfair text-3xl font-bold text-background mb-6 pb-2 border-b-2 border-primary inline-block">
          Watch Specifications
        </h3>

        {/* Általános Specifikációk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
          <InfoRow label="Brand" value={data.watchItem?.brand} />
          <InfoRow label="Model" value={data.watchItem?.model} />
          <InfoRow label="Category" value={data.watchItem?.category} />
          <InfoRow
            label="Production Year"
            value={data.watchItem?.productionYear}
          />
          <InfoRow label="Material" value={data.watchItem?.material} />
          <InfoRow label="Condition" value={data.watchItem?.condition} />
          <InfoRow
            label="Weight"
            value={
              data.watchItem?.weight ? `${data.watchItem.weight} g` : undefined
            }
          />
          <InfoRow
            label="Original"
            value={data.watchItem?.isOriginal ? "Yes" : "No"}
          />
          <InfoRow
            label="Has Box"
            value={data.watchItem?.hasBox ? "Yes" : "No"}
          />
          <InfoRow
            label="Has Papers"
            value={data.watchItem?.hasPapers ? "Yes" : "No"}
          />
        </div>

        {/* ── KATEGÓRIA SPECIFIKUS ADATOK ── */}

        {/* Wristwatch */}
        {data.watchItem?.category === "WRISTWATCH" &&
          data.watchItem.wristwatch && (
            <div className="mt-12">
              <h3 className="font-playfair text-3xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-primary inline-block">
                Wristwatch Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                <InfoRow
                  label="Movement Type"
                  value={data.watchItem.wristwatch.movementType}
                />
                <InfoRow
                  label="Case Diameter"
                  value={
                    data.watchItem.wristwatch.caseDiameter
                      ? `${data.watchItem.wristwatch.caseDiameter} mm`
                      : undefined
                  }
                />
                <InfoRow
                  label="Water Resistance"
                  value={data.watchItem.wristwatch.waterResistance}
                />
                <InfoRow
                  label="Strap Material"
                  value={data.watchItem.wristwatch.strapMaterial}
                />
                <InfoRow
                  label="Glass Type"
                  value={data.watchItem.wristwatch.glassType}
                />
              </div>
            </div>
          )}

        {/* Pocket Watch */}
        {data.watchItem?.category === "POCKETWATCH" &&
          data.watchItem.pocketWatch && (
            <div className="mt-12">
              <h3 className="font-playfair text-3xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-primary inline-block">
                Pocket Watch Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                <InfoRow
                  label="Case Type"
                  value={data.watchItem.pocketWatch.caseType}
                />
                <InfoRow
                  label="Movement Type"
                  value={data.watchItem.pocketWatch.movementType}
                />
                <InfoRow
                  label="Has Chain"
                  value={data.watchItem.pocketWatch.hasChain ? "Yes" : "No"}
                />
                <InfoRow
                  label="Complications"
                  value={data.watchItem.pocketWatch.complications}
                />
              </div>
            </div>
          )}

        {/* Smartwatch */}
        {data.watchItem?.category === "SMARTWATCH" &&
          data.watchItem.smartwatch && (
            <div className="mt-12">
              <h3 className="font-playfair text-3xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-primary inline-block">
                Smartwatch Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                <InfoRow
                  label="Operating System"
                  value={data.watchItem.smartwatch.os}
                />
                <InfoRow
                  label="Battery Life"
                  value={
                    data.watchItem.smartwatch.batteryLife
                      ? `${data.watchItem.smartwatch.batteryLife} hours`
                      : undefined
                  }
                />
                <InfoRow
                  label="Screen Type"
                  value={data.watchItem.smartwatch.screenType}
                />
                <InfoRow
                  label="Sensors"
                  value={data.watchItem.smartwatch.sensors}
                />
                <InfoRow
                  label="Compatibility"
                  value={data.watchItem.smartwatch.compatibility}
                />
              </div>
            </div>
          )}

        {/* Clock */}
        {data.watchItem?.category === "CLOCK" && data.watchItem.clock && (
          <div className="mt-12">
            <h3 className="font-playfair text-3xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-primary inline-block">
              Clock Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
              <InfoRow
                label="Clock Type"
                value={data.watchItem.clock.clockType}
              />
              <InfoRow
                label="Power Source"
                value={data.watchItem.clock.powerSource}
              />
              <InfoRow
                label="Chime Type"
                value={data.watchItem.clock.chimeType}
              />
              <InfoRow
                label="Dimensions"
                value={data.watchItem.clock.dimensions}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
