import { useParams } from "react-router-dom";
import { getUserId } from "../api/axios";
import AuctionInformation from "../components/layout/AuctionInformation";
import BidInformation from "../components/layout/BidInformation";
import { useAuctionData } from "../hooks/useAuctions";
import AuctionOwnerPanel from "../components/layout/AuctionOwnerPanel";
import ReviewForm from "../features/review/ReviewForm";
import { useAuctionBids } from "../hooks/useBids";

export default function AuctionPage() {
  const { id } = useParams();
  const { data: auctionData } = useAuctionData(Number(id));
  const { data: bidsData } = useAuctionBids(Number(id), 10);

  const userId = getUserId();

  const isUserAuction = userId === auctionData?.userId;
  const winner =
    auctionData?.status === "ENDED" &&
    auctionData?.bids?.[0]?.userId === userId;

  return (
    <>
      {isUserAuction ? <AuctionOwnerPanel /> : winner && <ReviewForm />}
      <AuctionInformation data={auctionData} />
      <BidInformation data={bidsData || []} />
    </>
  );
}
