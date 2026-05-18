import { useParams } from "react-router-dom";
import { socket } from "../../main";
import { useEffect } from "react";
import type { AuctionFullData } from "../../dto/auction.dto";

interface AuctionInformationProps {
  data: AuctionFullData | undefined;
}

export default function AuctionInformation({ data }: AuctionInformationProps) {
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    socket.emit("joinAuction", id);

    socket.on("BidUpdated", (updatedData) => {
      console.log("New bid: ", updatedData);
    });

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("BidUpdated");
    };
  }, [id]);

  return (
    <>
      <div
        style={{ border: "1px solid black", margin: "10px", padding: "10px" }}
      >
        <h2>Basic Auction Info</h2>
        <p>Title: {data?.title}</p>
        <p>Description: {data?.description}</p>
        <p>Auction Type: {data?.auctionType}</p>
        <p>Start Time: {data?.startTime?.toLocaleString()}</p>
        <p>End Time: {data?.endTime?.toLocaleString()}</p>
        <p>Starting Price: {data?.startingPrice}</p>
        <p>Reserve Price: {data?.reservePrice ?? "None"}</p>
        <p>Buying Price: {data?.buyingPrice ?? "None"}</p>
        <p>Tick Interval (Dutch): {data?.tickInterval}</p>
        <p>Money Interval (Dutch): {data?.moneyInterval}</p>
        <p>Min Bid Increment: {data?.minBidIncrement}</p>
        <p>Is Ascending: {data?.isAscending ? "Yes" : "No"}</p>
      </div>

      <div
        style={{ border: "1px solid blue", margin: "10px", padding: "10px" }}
      >
        <h2>General Watch Info</h2>
        <p>Brand: {data?.watchItem?.brand}</p>
        <p>Model: {data?.watchItem?.model}</p>
        <p>Production Year: {data?.watchItem?.productionYear}</p>
        <p>Material: {data?.watchItem?.material}</p>
        <p>Condition: {data?.watchItem?.condition}</p>
        <p>Weight: {data?.watchItem?.weight}</p>
        <p>Has Box: {data?.watchItem?.hasBox ? "Yes" : "No"}</p>
        <p>Has Papers: {data?.watchItem?.hasPapers ? "Yes" : "No"}</p>
        <p>Is Original: {data?.watchItem?.isOriginal ? "Yes" : "No"}</p>
        <p>Category: {data?.watchItem?.category}</p>
      </div>

      {data?.watchItem?.wristwatch && (
        <div
          style={{ border: "1px solid green", margin: "10px", padding: "10px" }}
        >
          <h3>Wristwatch Details</h3>
          <p>Movement: {data.watchItem.wristwatch.movementType}</p>
          <p>Diameter: {data.watchItem.wristwatch.caseDiameter} mm</p>
          <p>Water Resistance: {data.watchItem.wristwatch.waterResistance}</p>
          <p>Strap Material: {data.watchItem.wristwatch.strapMaterial}</p>
          <p>Glass Type: {data.watchItem.wristwatch.glassType}</p>
        </div>
      )}

      {data?.watchItem?.pocketWatch && (
        <div
          style={{
            border: "1px solid orange",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>Pocket Watch Details</h3>
          <p>Case Type: {data.watchItem.pocketWatch.caseType}</p>
          <p>Movement: {data.watchItem.pocketWatch.movementType}</p>
          <p>Has Chain: {data.watchItem.pocketWatch.hasChain ? "Yes" : "No"}</p>
          <p>Complications: {data.watchItem.pocketWatch.complications}</p>
        </div>
      )}

      {data?.watchItem?.smartwatch && (
        <div
          style={{
            border: "1px solid purple",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>Smartwatch Details</h3>
          <p>OS: {data.watchItem.smartwatch.os}</p>
          <p>Battery Life: {data.watchItem.smartwatch.batteryLife} hours</p>
          <p>Screen: {data.watchItem.smartwatch.screenType}</p>
          <p>Sensors: {data.watchItem.smartwatch.sensors}</p>
          <p>Compatibility: {data.watchItem.smartwatch.compatibility}</p>
        </div>
      )}

      {data?.watchItem?.clock && (
        <div
          style={{ border: "1px solid red", margin: "10px", padding: "10px" }}
        >
          <h3>Clock Details</h3>
          <p>Clock Type: {data.watchItem.clock.clockType}</p>
          <p>Power Source: {data.watchItem.clock.powerSource}</p>
          <p>Chime Type: {data.watchItem.clock.chimeType}</p>
          <p>Dimensions: {data.watchItem.clock.dimensions}</p>
        </div>
      )}
    </>
  );
}
