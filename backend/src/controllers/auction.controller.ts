import type { Request, Response } from "express";
import { auctionService } from "../services/auction.service";
import type { AuctionFilterDTO, CreateAuctionDTO } from "../dto/auction.dto";
import type { WatchCategory } from "../../generated/prisma";

export async function createAuction(req: Request, res: Response) {
    console.log("BODY:", req.body);
    const body = req.body as CreateAuctionDTO;
    const userId = req.user?.id as number;

    try {
        let result = await auctionService.createAuction(body,userId);
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

export async function getUserAuctions(req: Request, res: Response) {
    const userId = req.user?.id as number;

    try {
        const result = await auctionService.getUserAuctions(userId);
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

export async function addToWatchList(req: Request, res: Response) {
    const userId = req.user?.id as number;
    const auctionId = Number(req.body.auctionId);

    if (isNaN(auctionId)) {
        return res.status(400).json({ error: "Invalid Auction ID" })
    }

    try{
        const watchList = await auctionService.addToWatchList(userId,auctionId);
        return res.status(200).json(watchList);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error"})
    }
}

export async function getWatchList(req: Request, res: Response) {
    const userId = req.user?.id as number;

    try{
        const watchList = await auctionService.getWatchList(userId);
        return res.status(200).json(watchList);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error"})
    }
}

export async function deleteAuctionFromWatchList(req: Request, res: Response) {
    const userId = req.user?.id as number;
    const auctionId = Number(req.body.auctionId);

    if (isNaN(auctionId)) {
        return res.status(400).json({ error: "Invalid Auction ID" })
    }

    try{
        const watchList = await auctionService.deleteAuctionFromWatchList(userId,auctionId);
        return res.status(200).json({ message: "Auction deleted successfully from watch list!"});
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unkowon error"})
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

export async function uploadAuctionImages(req: Request, res: Response) {
    const auctionId = Number(req.params.id);
    const userId = req.user?.id as number;

    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: "No images provided" });
        }

        const files = req.files as Express.Multer.File[];
        const updatedAuction = await auctionService.uploadAuctionFiles(auctionId, userId, files);

        res.status(200).json({ message: "Images uploaded successfully", auction: updatedAuction });
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}