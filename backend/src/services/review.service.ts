import { date } from 'zod'
import { prisma } from '../db/client'
import { io } from "../utils/socket"
import type { ReviewDTO } from '../dto/review.dto'

export const reviewService = {
    async createReview(data: ReviewDTO,userId: number,auctionId: number) {
        if(!userId) {
            throw new Error("User ID not given!")
        }

        if(!auctionId) {
            throw new Error("Auction ID not given!")
        }

        const auctionWonByUser = await prisma.auction.findFirst({
            where: { id: auctionId },
            include: {
                user: {
                    include: { seller: true }
                },
                bids: { 
                    where: { userId: userId , isWinner: true}
                }
            }
        })
        
        if (!auctionWonByUser) {
            throw new Error("Auction not found!")
        }

        if (auctionWonByUser.bids.length === 0) {
            throw new Error("You cannot review this user, because you didn't win this auction!")
        }

        const sellerId = auctionWonByUser.user?.seller?.id;

        if(!sellerId) {
            throw new Error("The creator of this auction is not registered as a seller!")
        }

        const existingReview = await prisma.review.findFirst({
            where: {auctionId: auctionWonByUser.id as number}
        })

        if(existingReview){
            throw new Error("You already have a review connected to this auction and seller!")
        }

        const created = await prisma.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    authorId: userId,
                    sellerId: sellerId,
                    rating: data.rating,
                    comment: data.comment,
                    auctionId: auctionId
                }
            })

            const allReviews = await tx.review.findMany({
                where: { sellerId: sellerId }
            })

            const allRatings = allReviews.map((r) => r.rating);
            let rating = 0;

            if(allRatings.length > 0){
                const sum = allRatings.reduce((acc, curr) => acc + curr, 0)
                rating = sum / allRatings.length;
            } else {
                rating = data.rating;
            }

            const seller = await tx.seller.update({
                where: { id: sellerId },
                data: { rating: rating }
            })

            return review;
        })
        return created;
    },
    async deleteReview(reviewId: number,userId: number, userRole: string) {
        if(!userId) {
            throw new Error("User ID not given!")
        }

        if(!reviewId) {
            throw new Error("Review ID not given!")
        }

        return await prisma.$transaction(async (tx) => {
            const review = await tx.review.findUnique({
                where: { id: reviewId }
            })

            if (!review) {
                throw new Error("Review not found!");
            }

            const isStaff = userRole === "ADMIN" || userRole === "MODERATOR";

            if (review.authorId !== userId && !isStaff) {
                throw new Error("You can delete your own reviews or you need to be an ADMIN/MODERATOR!");
            }

            await tx.review.delete({
                where: { id: reviewId }
            })

            const allReviews = await tx.review.findMany({
                where: { sellerId: review.sellerId }
            })

            const allRatings = allReviews.map((r) => r.rating);
            let rating = 0

            if(allRatings.length > 0){
                const sum = allRatings.reduce((acc, curr) => acc + curr, 0)
                rating = sum / allRatings.length;
            }

            await tx.seller.update({
                where: { id: review.sellerId },
                data: { rating: rating }
            })

            return { message: "Review deleted successfully!"}
        })
    },
    async getReviewsByUserId(userId: number) {
        if (!userId) {
            throw new Error("User ID not given!");
        }

        const userWithSeller = await prisma.user.findUnique({
            where: { id: userId },
            select: { seller: true }
        });

        if (!userWithSeller || !userWithSeller.seller) {
            return [];
        }

        const reviews = await prisma.review.findMany({
            where: { sellerId: userWithSeller.seller.id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
                reviewer: {
                    id: r.author.id,
                    username: r.author.username
                }
            })
        );
    }
}