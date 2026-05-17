import { useParams } from "react-router-dom";
import { useCategoryData } from "../../hooks/useAuctions";
import AuctionListItem from "./AuctionListItem";

export default function Wristwatch() {
  const { category } = useParams();

  const { data, isLoading } = useCategoryData(category || "");

  console.log(data);

  if (isLoading) {
    return (
      <div className="p-10 text-center font-bold font-playfair">
        Loading auctions...
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="font-playfair text-4xl text-surface mx-20">
          Wristwatches
        </h1>
        <div className="flex flex-row flex-wrap gap-10 mx-24">
          {data?.promoted.map((auction) => (
            <AuctionListItem key={auction.id} auction={auction} />
          ))}
        </div>
        <div className="flex flex-row flex-wrap gap-10 mx-24">
          {data?.others.map((auction) => (
            <AuctionListItem key={auction.id} auction={auction} />
          ))}
        </div>
      </div>
    </>
  );
}
