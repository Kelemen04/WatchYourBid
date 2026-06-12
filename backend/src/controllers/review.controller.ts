import type { Request, Response } from "express";
import { reviewService } from "../services/review.service";
import { UserReviewResponseSchema, type ReviewDTO } from "../dto/review.dto";
import z from "zod";

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
    const userRole = req.user?.role as string;

    try{
        const review = await reviewService.deleteReview(reviewId,userId,userRole);
        return res.status(200).json(review);
    } catch (err) {
        res.status(400).json({error: err instanceof Error ? err.message: "Unknown error!"})
    }
}

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 5;

    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID!" });
    }

    const reviews = await reviewService.getReviewsByUserId(userId, skip, take);
    
    const cleanResponse = z.array(UserReviewResponseSchema).parse(reviews);

    return res.status(200).json(cleanResponse);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Something went wrong!" });
  }
};