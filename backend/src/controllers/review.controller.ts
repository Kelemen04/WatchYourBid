import { error } from "console";
import type { Request, Response } from "express";
import { reviewService } from "../services/review.service";
import type { ReviewDTO } from "../dto/review.dto";

export async function createReview(req: Request,res: Response) {
    const userId = req.user?.id as number;
    const auctionId = Number(req.params.id);
    const data = req.body as ReviewDTO;

    try{
        const review = await reviewService.createReview(data,userId,auctionId);
        return res.status(200).json(review);
    } catch (err) {
        res.status(400).json({error: err instanceof Error ? err.message: "Unknown error!"})
    }
}

export async function deleteReview(req: Request,res: Response) {
    const userId = req.user?.id as number;
    const reviewId = Number(req.params.id);

    try{
        const review = await reviewService.deleteReview(reviewId,userId);
        return res.status(200).json(review);
    } catch (err) {
        res.status(400).json({error: err instanceof Error ? err.message: "Unknown error!"})
    }
}