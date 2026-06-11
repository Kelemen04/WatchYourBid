import type { Request, Response } from "express";
import { GetBidsNumberSchema, MyBidsResponseSchema, type AutoBidDTO, type PlaceBidDTO, type PlacePromotingBidDTO } from "../dto/bids.dto";
import { bidService } from "../services/bid.service";
import { io } from "../utils/socket";
import z from "zod";
import { GetTransactionsNumberSchema } from "../dto/transaction.dto";

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

export async function placePromotingBid(req: Request, res: Response) {
  const userId = req.user?.id as number;
  const body = req.body as PlacePromotingBidDTO;
  const auctionId = Number(req.params.id);

  try{
    const placePromotingBid= await bidService.placePromotingBid(body,userId,auctionId);
    res.status(200).json(placePromotingBid);
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

export async function buyNow(req: Request, res: Response) {
  const userId = req.user?.id as number;
  const auctionId = Number(req.params.id);

  try{
    const buyNowResult = await bidService.buyNow(userId,auctionId);
    res.status(200).json(buyNowResult);
  } catch(e){
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function getAuctionBids(req: Request, res: Response) {
  const auctionId = Number(req.params.id);

  try{

    const validationResult = GetBidsNumberSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
    }

    const { take } = validationResult.data;

    
    const auctionBids = await bidService.getAuctionBids(auctionId,take);
    res.status(200).json(auctionBids);
  } catch(e){
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export const getMyBidsHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id as number;

  try {
    const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
            
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
    }
            
    const { take,skip } = validationResult.data;

    const bids = await bidService.getMyBids(userId, skip, take);
    const cleanResponse = z.array(MyBidsResponseSchema).parse(bids);

    return res.status(200).json(cleanResponse);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch your bids!" });
  }
};