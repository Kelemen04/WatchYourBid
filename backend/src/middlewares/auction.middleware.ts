import type { Request, Response, NextFunction } from "express";
import { WatchCategory } from "../../generated/prisma";
import { prisma } from "../db/client";
import { error } from "console";

export function validateId(req: Request, res: Response, next: NextFunction){
    const id = Number(req.params.id);

    if(isNaN(id)){
        return res.status(400).json({ error: "The given id must be a number!" });
    }

    req.validatedId = id;

    next();
}

export function validateCategory(req: Request, res: Response, next: NextFunction){
    const category = req.params.categoryName as string;

    if(category.toUpperCase() !== WatchCategory.CLOCK && category.toUpperCase() !== WatchCategory.SMARTWATCH 
        && category.toUpperCase() !== WatchCategory.WRISTWATCH && category.toUpperCase() !== WatchCategory.POCKETWATCH){
        return res.status(400).json({ error: "The given category is incorrect!" });
    }

    req.validatedCategory = category.toUpperCase();

    next();
}

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