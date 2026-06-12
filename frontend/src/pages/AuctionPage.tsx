import { useParams } from "react-router-dom";
import { getUserId } from "../api/axios";
import AuctionInformation from "../components/layout/AuctionInformation";
import BidInformation from "../components/layout/BidInformation";
import { useAuctionData } from "../hooks/useAuctions";
import AuctionOwnerPanel from "../components/layout/AuctionOwnerPanel";
import ReviewForm from "../features/review/ReviewForm";

export default function AuctionPage() {
  const { id } = useParams();
  const { data: auctionData, isLoading } = useAuctionData(Number(id));

  const userId = getUserId();
  const isUserAuction = userId === auctionData?.userId;
  const winner =
    auctionData?.status === "ENDED" &&
    auctionData?.bids?.[0]?.userId === userId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-background"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-9/10 mx-auto px-4 sm:px-6 lg:px-8 py-10 font-inter relative">
      {isUserAuction && <AuctionOwnerPanel />}
      {winner && !isUserAuction && <ReviewForm auctionData={auctionData!} />}

      <div className="flex flex-col lg:flex-row gap-8 mt-6 items-start">
        <div className="w-full lg:w-2/3">
          <AuctionInformation data={auctionData} />
        </div>

        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <BidInformation />
          </div>
        </div>
      </div>
    </div>
  );
}
