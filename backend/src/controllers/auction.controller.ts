import type { Request, Response } from "express";
import { auctionService } from "../services/auction.service";
import type { AuctionFilterDTO, CreateAuctionDTO } from "../dto/auction.dto";
import type { WatchCategory } from "../../generated/prisma";

export async function createAuction(req: Request, res: Response) {
    console.log("BODY:", req.body);
    const body = req.body as CreateAuctionDTO;
    const userId = req.user?.id as number;

    try {
        const result = await auctionService.createAuction(body,userId);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err .message : "Unknown error" });
    }
}

export async function updateAuction(req: Request, res: Response) {
    const body = req.body as CreateAuctionDTO;
    const auctionId = Number(req.params.id);
    const userId = req.user?.id as number;

    try {
        const result = await auctionService.updateAuction(auctionId,userId,body);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function deleteAuction(req: Request, res: Response) {
    const auctionId = Number(req.params.id);
    const userId = req.user?.id as number;

    try {
        const result = await auctionService.deleteAuction(auctionId,userId);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function getHomeAuctions(req: Request, res: Response) {
    try {
        const result = await auctionService.getHomeAuctions();
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function getAuctionById(req: Request, res: Response) {
    const auctionId = req.validatedId as number;

    try {
        const result = await auctionService.getAuctionById(auctionId);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function getAuctionByCategory(req: Request, res: Response) {
    const category = req.validatedCategory as WatchCategory;
    console.log(category)
    try {
        const result = await auctionService.getAuctionByCategory(category);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}


export async function getAuctionByFilters(req: Request, res: Response) {
    const filters = req.filters as AuctionFilterDTO;
    try {
        const result = await auctionService.getAuctionByFilters(filters);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}