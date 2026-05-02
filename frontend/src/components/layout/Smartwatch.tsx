import { useParams } from "react-router-dom";
import { useCategoryData } from "../../hooks/useAuctions";
import AuctionListItem from "./AuctionListItem";

export default function Smartwatch() {
  const { category } = useParams();

  const { data } = useCategoryData(category || "");

  return (
    <>
      <div>
        <h1 className="font-playfair text-4xl text-surface mx-20">
          Smartwatches
        </h1>
        <div className="flex flew-row gap-10 mx-25">
          {data?.map((auction) => (
            <AuctionListItem key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
    </>
  );
}
