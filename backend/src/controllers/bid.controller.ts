import type { Request, Response } from "express";
import type { AutoBidDTO, PlaceBidDTO } from "../dto/bids.dto";
import { bidService } from "../services/bid.service";
import { io } from "../utils/socket";

export async function placeBid(req: Request, res: Response) {
  const userId = req.user?.id as number;
  const body = req.body as PlaceBidDTO;
  const auctionId = Number(req.params.id);

  try{
    const placeBid= await bidService.placeBid(body,userId,auctionId);
    res.status(200).json(placeBid);
  } catch(e){
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function placeAutoBid(req: Request, res: Response) {
  const body = req.body as AutoBidDTO;
  const userId = req.user?.id as number;
  const auctionId = Number(req.params.id);

  try{
    const placeAutoBid = await bidService.placeAutoBid(body,userId,auctionId);
    res.status(200).json(placeAutoBid);
  } catch(e){
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}