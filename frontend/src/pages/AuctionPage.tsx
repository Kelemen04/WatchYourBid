import { useParams } from "react-router-dom";
import { getUserId } from "../api/axios";
import AuctionInformation from "../components/layout/AuctionInformation";
import BidInformation from "../components/layout/BidInformation";
import { useAuctionData } from "../hooks/useAuctions";
import AuctionOwnerPanel from "../components/layout/AuctionOwnerPanel";

export default function AuctionPage() {
  const { id } = useParams();
  const { data } = useAuctionData(Number(id));

  const userId = getUserId();

  const isUserAuction = userId === data?.userId;

  return (
    <>
      {isUserAuction && <AuctionOwnerPanel />}
      <AuctionInformation data={data} />
      <BidInformation />
    </>
  );
}
