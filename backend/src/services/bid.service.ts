import type { AutoBidDTO, PlaceBidDTO } from "../dto/bids.dto";
import { prisma } from '../db/client'
import { io } from "../app"

export const bidService = {
    async placeBid(data: PlaceBidDTO, userId: number, auctionId: number) {
        const newBid = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            })

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

            if (data.bidAmount < auction.currentPrice + (auction.minBidIncrement || 0)) {
                throw new Error("The given amount must be higher than the current price!")
            }

            if (Date.now() > auction.endTime.getTime() || Date.now() < auction.startTime.getTime()) {
                throw new Error("Invalid bid, auction didn't start or it's already over!")
            }

            if (auction.userId == userId) {
                throw new Error("You can't bid on your own auction!")
            }

            if (auction.status != "ACTIVE") {
                throw new Error("Auction isn't active,you can't bid!")
            }

            const lastBid = await tx.bid.findFirst({
                where: { auctionId: auctionId },
                orderBy: { bidTime: "desc" }
            })

            if (lastBid && lastBid.userId === userId) {
                throw new Error("You're bid is already the highest!")
            }

            try {
                await tx.auction.update({
                    where: {
                        id: auctionId,
                        currentPrice: auction.currentPrice
                    },
                    data: {
                        currentPrice: data.bidAmount
                    },
                });
            } catch (error) {
                throw new Error("Someone else just placed a higher bid. Please try again!");
            }

            const newBid = await tx.bid.create({
                data: {
                    bidAmount: data.bidAmount,
                    userId: userId,
                    auctionId: auctionId
                }
            });

            io.to(`auction-${auctionId}`).emit("BidUpdated", {
                auctionId: auctionId,
                newPrice: newBid.bidAmount,
                bidderId: userId
            })

            return newBid;
        });

        io.to(`auction-${auctionId}`).emit("BidUpdated", {
            auctionId: auctionId,
            newPrice: newBid.bidAmount,
            bidderId: userId
        });

        await this.processAutoBids(auctionId, userId);

        return newBid;
    },

    async placeAutoBid(data: AutoBidDTO, userId: number, auctionId: number) {
        const autoBidEntry = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            })

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

            if (data.maxAmount < auction.currentPrice + (auction.minBidIncrement || 0)) {
                throw new Error("The given amount must be higher than the current price!")
            }

            if (Date.now() > auction.endTime.getTime() || Date.now() < auction.startTime.getTime()) {
                throw new Error("Invalid bid, auction didn't start or it's already over!")
            }

            if (auction.userId == userId) {
                throw new Error("You can't bid on your own auction!")
            }

            if (auction.status != "ACTIVE") {
                throw new Error("Auction isn't active,you can't bid!")
            }

            const lastBid = await tx.bid.findFirst({
                where: { auctionId: auctionId },
                orderBy: { bidTime: "desc" }
            })

            if (lastBid && lastBid.userId === userId) {
                throw new Error("You're bid is already the highest!")
            }

            if ((data.increment as number) < (auction.minBidIncrement as number)) {
                throw new Error("The given increment is lower than the given minimum increment!")
            }

            await tx.auction.update({
                where: { id: auctionId, currentPrice: auction.currentPrice },
                data: { currentPrice: auction.currentPrice + (data.increment as number || auction.minBidIncrement as number) }
            });

            const entry = await tx.autoBid.upsert({
                where: { userId_auctionId: { userId, auctionId } },
                update: { maxAmount: data.maxAmount, increment: data.increment },
                create: {
                    increment: data.increment as number,
                    maxAmount: data.maxAmount as number,
                    userId,
                    auctionId
                }
            });

            await tx.bid.create({
                data: {
                    bidAmount: auction.currentPrice + (data.increment as number || auction.minBidIncrement as number),
                    userId: userId,
                    auctionId: auctionId,
                    autoBidId: entry.id 
                }
            });

            return entry;
        });

        await this.processAutoBids(auctionId, userId);

        return autoBidEntry;
    },

    async processAutoBids(auctionId: number, userId: number) {
        let autoBidDetails: any = null;

        const nextWinnerId = await prisma.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            });

            const targetAutoBid = await tx.autoBid.findFirst({
                where: { 
                    auctionId: auctionId, 
                    userId: { not: userId },
                    maxAmount: { gte: (auction?.currentPrice || 0) + (auction?.minBidIncrement || 0) }
                },
                orderBy: { maxAmount: "desc" },
                include: { auction: true }
            });

            if (!targetAutoBid) return null;

            const auctionData = targetAutoBid.auction;
            const nextBidAmount = auctionData.currentPrice + (targetAutoBid.increment as number || auctionData.minBidIncrement as number);

            if (nextBidAmount <= targetAutoBid.maxAmount) {
                await tx.auction.update({
                    where: { id: auctionId, currentPrice: auctionData.currentPrice },
                    data: { currentPrice: nextBidAmount }
                });

                await tx.bid.create({
                    data: {
                        bidAmount: nextBidAmount,
                        userId: targetAutoBid.userId,
                        auctionId: auctionId,
                        autoBidId: targetAutoBid.id
                    }
                });

                autoBidDetails = {
                    auctionId,
                    newPrice: nextBidAmount,
                    bidderId: targetAutoBid.userId,
                    isAutoBid: true
                };

                return targetAutoBid.userId;
            }
            return null;
        });

        if (nextWinnerId && autoBidDetails) {
            io.to(`auction-${auctionId}`).emit("BidUpdated", autoBidDetails);

            await this.processAutoBids(auctionId, nextWinnerId);
        }
    }
}