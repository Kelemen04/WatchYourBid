import { useParams } from "react-router-dom";
import { socket } from "../../main";
import { useEffect, useState } from "react";
import type { AuctionFullData } from "../../dto/auction.dto";

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

    // Any helyett unknown a linter hiba elkerülésére
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
    // EGYETLEN NAGY FEHÉR DOBOZ AZ EGÉSZNEK
    <div className="flex flex-col gap-10 bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm">
      {/* ── KÉPGALÉRIA ── */}
      <div className="flex flex-col gap-4">
        {/* Fő nagy kép */}
        <div className="w-full aspect-[4/3] bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative group cursor-crosshair">
          <img
            src={activeImage}
            alt={data.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Kis indexképek (Thumbnails) */}
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
        <h1 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-background tracking-tight mb-4">
          {data.title}
        </h1>
        <p className="font-inter text-stone-600 leading-relaxed whitespace-pre-line text-[15px]">
          {data.description}
        </p>
      </div>

      {/* ── SPECIFIKÁCIÓK ── */}
      <div>
        <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-background mb-6 pb-2 border-b-2 border-[var(--color-primary)] inline-block">
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
        </div>

        {/* Tulajdonságok / Kiegészítők (Címkék) */}
        <div className="flex flex-wrap gap-4 pt-6 mt-4">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border ${
              data.watchItem?.isOriginal
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-stone-50 border-stone-200 text-stone-400"
            }`}
          >
            Original
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border ${
              data.watchItem?.hasBox
                ? "bg-stone-800 border-stone-800 text-white"
                : "bg-stone-50 border-stone-200 text-stone-400"
            }`}
          >
            Has Box
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border ${
              data.watchItem?.hasPapers
                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                : "bg-stone-50 border-stone-200 text-stone-400"
            }`}
          >
            Has Papers
          </span>
        </div>

        {/* ── KATEGÓRIA SPECIFIKUS ADATOK ── */}

        {/* Wristwatch */}
        {data.watchItem?.category === "WRISTWATCH" &&
          data.watchItem.wristwatch && (
            <div className="mt-12">
              <h3 className="font-[var(--font-playfair)] text-xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-stone-200 inline-block">
                Wristwatch Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                <InfoRow
                  label="Movement Type"
                  value={data.watchItem.wristwatch.movementType}
                />
                <InfoRow
                  label="Case Diameter"
                  value={`${data.watchItem.wristwatch.caseDiameter} mm`}
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
              <h3 className="font-[var(--font-playfair)] text-xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-stone-200 inline-block">
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
              <h3 className="font-[var(--font-playfair)] text-xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-stone-200 inline-block">
                Smartwatch Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                <InfoRow
                  label="Operating System"
                  value={data.watchItem.smartwatch.os}
                />
                <InfoRow
                  label="Battery Life"
                  value={`${data.watchItem.smartwatch.batteryLife} hours`}
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
            <h3 className="font-[var(--font-playfair)] text-xl font-bold text-stone-800 mb-6 pb-2 border-b-2 border-stone-200 inline-block">
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
