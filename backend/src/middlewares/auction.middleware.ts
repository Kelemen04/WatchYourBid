import type { Request, Response, NextFunction } from "express";
import { WatchCategory } from "../../generated/prisma";
import { prisma } from "../db/client";
import { AuctionFilterSchema } from "../dto/auction.dto";

// Validate numeric route ID
export function validateId(req: Request, res: Response, next: NextFunction){
    const id = Number(req.params.id);

    if(isNaN(id)){
        return res.status(400).json({ error: "The given id must be a number!" });
    }

    req.validatedId = id;

    next();
}

// Validate category name
export function validateCategory(req: Request, res: Response, next: NextFunction){
    const category = req.params.categoryName as string;

    if(category.toUpperCase() !== WatchCategory.CLOCK && category.toUpperCase() !== WatchCategory.SMARTWATCH 
        && category.toUpperCase() !== WatchCategory.WRISTWATCH && category.toUpperCase() !== WatchCategory.POCKETWATCH){
        return res.status(400).json({ error: "The given category is incorrect!" });
    }

    req.validatedCategory = category.toUpperCase();

    next();
}

// Track view/click counts for trends
export async function incrementClick(req: Request, res: Response, next: NextFunction){
    const auctionId = req.validatedId as number;

    try{
        await prisma.trendings.upsert({
            where: { auctionId: auctionId },
            update: { clicks: { increment: 1}},
            create: {
                auctionId: auctionId,
                clicks: 1,
            }
        })
    } catch(err) {
        console.error("Trending counter error: ",err);
    }

    next()
}

// Validate query parameters with Zod
export function validateFilters(req: Request, res: Response, next: NextFunction){

    const result = AuctionFilterSchema.safeParse(req.query);

    if(!result.success){
        return res.status(400).json({ error: "Invalid filter parameter!", details: result.error.format()})
    }

    const validData = result.data;

    req.filters = validData;

    next();
}