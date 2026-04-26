import type { Request, Response } from "express";
import { auctionService } from "../services/auction.service";
import type { CreateAuctionDTO } from "../dto/auction.dto";
import type { WatchCategory } from "../../generated/prisma";

export async function createAuction(req: Request, res: Response) {
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

    try {
        const result = await auctionService.getAuctionByCategory(category);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}


export async function getAuctionByFilters(req: Request, res: Response) {
    const category = req.params.category as string;
    try {
        const filters = {
            searchTerm: (req.query.searchTerm as string) || "",
            category: category,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : null,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : null,
            onlyWithBuyingPrice: req.query.onlyWithBuyingPrice === 'true',
            auctionType: (req.query.auctionType as any) || null,
            endingSoon: req.query.endingSoon === 'true',

            brand: typeof req.query.brand === 'string' ? [req.query.brand] : (req.query.brand as string[]) || [],
            condition: typeof req.query.condition === 'string' ? [req.query.condition] : (req.query.condition as string[]) || [],
            material: typeof req.query.material === 'string' ? [req.query.material] : (req.query.material as string[]) || [],
            
            minYear: req.query.minYear ? Number(req.query.minYear) : null,
            maxYear: req.query.maxYear ? Number(req.query.maxYear) : null,
            
            sortBy: (req.query.sortBy as string) || "newest",
            limit: req.query.limit ? Number(req.query.limit) : 20,
            page: req.query.page ? Number(req.query.page) : 1
        };

        const result = await auctionService.getAuctionByFilters(filters);
        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
}