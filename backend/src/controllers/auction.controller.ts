import type { Request, Response } from "express";
import { auctionService } from "../services/auction.service";
import { AuctionFilterSchema, type AuctionFilterDTO, type CreateAuctionDTO } from "../dto/auction.dto";
import type { WatchCategory } from "../../generated/prisma";
import { ZodError } from "zod";
import { GetTransactionsNumberSchema } from "../dto/transaction.dto";

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
        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
                
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
                
        const { take,skip } = validationResult.data;

        const result = await auctionService.getUserAuctions(userId, skip, take);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function getHomeAuctions(req: Request, res: Response) {
    const userId = req.user?.id as number;
    try {
        const result = await auctionService.getHomeAuctions(userId);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function getAuctionById(req: Request, res: Response) {
    const auctionId = req.validatedId as number;
    const userId = req.user?.id as number;
    try {
        const result = await auctionService.getAuctionById(auctionId, userId);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function getAuctionByCategory(req: Request, res: Response) {
    const category = (req as any).validatedCategory as WatchCategory;
    const userId = req.user?.id as number;

    if (!category) {
        return res.status(400).json({ error: "Category not found in request!" });
    }

    try {
        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
                
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
                
        const { take,skip } = validationResult.data;

        const result = await auctionService.getAuctionByCategory(category,userId, skip, take);
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
        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
                
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
                
        const { take,skip } = validationResult.data;

        const watchList = await auctionService.getWatchList(userId, skip, take);
        return res.status(200).json(watchList);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error"})
    }
}

export async function deleteAuctionFromWatchList(req: Request, res: Response) {
    const userId = req.user?.id as number;
    const auctionId = Number(req.params.id);

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
    try {
        const filters = AuctionFilterSchema.safeParse(req.query);
        if (!filters.success) {
          return res.status(400).json({ error: filters.error.issues[0]?.message || "Invalid input!" });
        }

        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
                
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
                
        const { take,skip } = validationResult.data;
    
        const result = await auctionService.getAuctionByFilters(filters.data, skip, take);
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

export async function approveAuction(req: Request, res: Response) {
    const auctionId = Number(req.params.id);
    try {
        const result = await auctionService.approveAuction(auctionId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function cancelAuctionByStaff(req: Request, res: Response) {
    const auctionId = Number(req.params.id);
    try {
        const result = await auctionService.cancelAuctionByStaff(auctionId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}

export async function getPendingAuctions(req: Request, res: Response) {
    try {
        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
                
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
                
        const { take,skip } = validationResult.data;

        const auctions = await auctionService.getPendingAuctions(skip, take);
        res.status(200).json(auctions);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch pending auctions" });
    }
}

export async function getAllAuctions(req: Request, res: Response) {
    try {
        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
                
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
                
        const { take,skip } = validationResult.data;

        const auctions = await auctionService.getAllAuctions(skip, take);
        res.status(200).json(auctions);
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Error fetching all auctions" });
    }
}