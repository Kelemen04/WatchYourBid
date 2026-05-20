import type { AutoBidDTO, PlaceBidDTO, PlacePromotingBidDTO } from "../dto/bids.dto";
import { prisma } from '../db/client'
import { io } from "../utils/socket"
import { auctionTasks } from "../jobs/auction.queues";

export const bidService = {
    async placeBid(data: PlaceBidDTO, userId: number, auctionId: number) {
        const newBid = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            if(user.balance < data.bidAmount){
                throw new Error("Your don't have enough money to make that bid!")
            }

            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            })

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

             if (auction.userId == userId) {
                throw new Error("You can't bid on your own auction!")
            }

            if (auction.status != "ACTIVE") {
                throw new Error("Auction isn't active,you can't bid!")
            }

            if (Date.now() > auction.endTime.getTime() || Date.now() < auction.startTime.getTime()) {
                throw new Error("Invalid bid, auction didn't start or it's already over!")
            }

            if (auction.auctionType === "DUTCH") {
                if (data.bidAmount !== auction.currentPrice) {
                    throw new Error("In a Dutch auction, you must buy at exactly the current ticking price!");
                }

                await tx.auction.update({
                    where: { id: auctionId },
                    data: { status: "ENDED", currentPrice: data.bidAmount }
                });
                
                const winningBid = await tx.bid.create({
                    data: {
                        bidAmount: data.bidAmount,
                        userId: userId,
                        auctionId: auctionId,
                        isWinner: true
                    }
                });

                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: data.bidAmount } }
                });
  
                await tx.user.update({
                    where: { id: auction.userId as number },
                    data: { balance: { increment: data.bidAmount } }
                });

                await tx.transaction.create({
                    data: {
                        userId: userId,
                        amount: data.bidAmount,
                        type: "AUCTION_PAYMENT",
                        status: "SUCCESS",
                        stripeSessionId: `auc-close-${auction.id}`
                    }
                });
  
                await tx.transaction.create({
                    data: {
                        userId: auction.userId as number,
                        amount: data.bidAmount,
                        type: "AUCTION_RECEIVE",
                        status: "SUCCESS",
                        stripeSessionId: `auc-recv-${auction.id}`
                    }
                });

                const delayedJobs = await auctionTasks.getDelayed();
                for (const job of delayedJobs) {
                    if (job.id?.startsWith(`price-drop-${auctionId}`) || job.id?.startsWith(`close-${auctionId}`)) {
                        await job.remove();
                    }
                }

                io.to(`auction-${auctionId}`).emit("AuctionEnded", {
                    auctionId: auctionId,
                    winnerId: userId,
                    finalPrice: data.bidAmount
                });

                return winningBid;
            }

            const lastBid = await tx.bid.findFirst({
                where: { auctionId: auctionId },
                orderBy: { bidTime: "desc" }
            })

            if (auction.auctionType === "JAPANESE") {
                if (data.bidAmount !== auction.currentPrice) {
                    throw new Error("In a Japanese auction, you must bid exactly the current round price!");
                }

                if (lastBid && lastBid.userId === userId && lastBid.bidAmount === auction.currentPrice) {
                    throw new Error("You already accepted the price for this round!");
                }
            } 
            else if (auction.auctionType === "FPSB" || auction.auctionType === "VICKREY") {
                if (data.bidAmount < auction.startingPrice) {
                    throw new Error("Your secret bid must be at least the starting price!");
                }

                const alreadyBid = await tx.bid.findFirst({ where: { auctionId, userId } });
                if (alreadyBid) {
                    throw new Error("You have already submitted your secret bid for this auction!");
                }
            } 
            else {
                if (lastBid && lastBid.userId === userId) {
                    throw new Error("You're bid is already the highest!")
                }

                if (data.bidAmount < auction.currentPrice + (auction.minBidIncrement || 0)) {
                    throw new Error("The given amount must be higher than the current price + minimum increment!");
                }

                try {
                    await tx.auction.update({
                        where: { id: auctionId, currentPrice: auction.currentPrice },
                        data: { currentPrice: data.bidAmount },
                    });
                } catch (error) {
                    throw new Error("Someone else just placed a higher bid. Please try again!");
                }
            }

            const newBid = await tx.bid.create({
                data: {
                    bidAmount: data.bidAmount,
                    userId: userId,
                    auctionId: auctionId
                }
            });

            return newBid;
        });

        const auction = await prisma.auction.findFirst({
            where: { id: newBid.auctionId }
        })

        if (auction?.status === "ENDED") {
            return newBid;
        }

        if(auction?.auctionType === "FPSB" || auction?.auctionType === "VICKREY"){
            io.to(`auction-${auctionId}`).emit("BidUpdated", {
                auctionId: auctionId,
            });
        } else {
            io.to(`auction-${auctionId}`).emit("BidUpdated", {
                auctionId: auctionId,
                newPrice: newBid.bidAmount,
                bidderId: userId
            });
        }

        if (auction?.auctionType === "ENGLISH") {
            await this.processAutoBids(auctionId, userId);
        }

        return newBid;
    },

    async placePromotingBid(data: PlacePromotingBidDTO, userId: number, auctionId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newBid = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            if(user.balance < data.maxAmount){
                throw new Error("Your don't have enough money to make that bid!")
            }

            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            })

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

            if(auction.userId !== userId){
                throw new Error("This is not your auction,you can't promote it!")
            }

            if (auction.status !== "ACTIVE") {
                throw new Error("You can only promote active auctions!");
            }

            const existingBid = await tx.promotingBids.findFirst({
                where: {
                    auctionId: auctionId,
                    targetDate: today
                }
            })

            if (existingBid) {
                throw new Error("You already promoted this auction today!");
            }

            const newPromotingBid = await tx.promotingBids.create({
                data: {
                    maxAmount: data.maxAmount,
                    userId: userId,
                    auctionId: auctionId,
                    targetDate: today,
                }
            });

            return newPromotingBid;
        });


        return newBid;
    },

    async placeAutoBid(data: AutoBidDTO, userId: number, auctionId: number) {
        const autoBidEntry = await prisma.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            })

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

            if (auction.auctionType !== "ENGLISH") {
                throw new Error("Auto-bidding is only available for English auctions!");
            }
            const user = await tx.user.findUnique({
                where: { id: userId }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            if(user.balance < data.maxAmount){
                throw new Error("Your don't have enough money to make that bid!")
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

            if (!auction || auction.status !== "ACTIVE") {
                return null;
            }

            const minRequiredWalletBalance = (auction?.currentPrice || 0) + (auction?.minBidIncrement || 0);

            const targetAutoBid = await tx.autoBid.findFirst({
                where: { 
                    auctionId: auctionId, 
                    userId: { not: userId },
                    maxAmount: { gte: (auction?.currentPrice || 0) + (auction?.minBidIncrement || 0) },
                    user: { balance: { gte: minRequiredWalletBalance }}
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
    },

    async buyNow(userId: number,auctionId: number){
        const buyNow = await prisma.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            })

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

            if(auction.buyingPrice){
                const user = await tx.user.findUnique({
                    where: { id: userId }
                })

                if (!user) {
                    throw new Error("This user doesn't exist!")
                }

                if(user.balance < auction.buyingPrice){
                    throw new Error("Your don't have enough money to make that bid!")
                }

                if (auction.userId == userId) {
                    throw new Error("You can't bid on your own auction!")
                }

                if (auction.status != "ACTIVE") {
                    throw new Error("Auction isn't active,you can't buy it!")
                }

                await tx.auction.update({
                    where: { id: auctionId, currentPrice: auction.currentPrice },
                    data: { status: "ENDED" }
                });

                await tx.bid.create({
                    data: {
                        bidAmount: auction.buyingPrice,
                        userId: userId,
                        auctionId: auctionId,
                        isWinner: true
                    }
                });

                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: auction.buyingPrice } }
                });
  
                await tx.user.update({
                    where: { id: auction.userId as number },
                    data: { balance: { increment: auction.buyingPrice } }
                });

                await tx.transaction.create({
                    data: {
                        userId: userId,
                        amount: auction.buyingPrice,
                        type: "AUCTION_PAYMENT",
                        status: "SUCCESS",
                        stripeSessionId: `auc-close-${auction.id}`
                    }
                });
  
                await tx.transaction.create({
                    data: {
                        userId: auction.userId as number,
                        amount: auction.buyingPrice,
                        type: "AUCTION_RECEIVE",
                        status: "SUCCESS",
                        stripeSessionId: `auc-recv-${auction.id}`
                    }
                });

                const delayedJobs = await auctionTasks.getDelayed();
                for (const job of delayedJobs) {
                    if (job.id?.startsWith(`price-drop-${auctionId}`) || job.id?.startsWith(`price-up-${auctionId}`) || job.id?.startsWith(`close-${auctionId}`)) {
                        await job.remove();
                    }
                }

                io.to(`auction-${auctionId}`).emit("AuctionEnded", {
                    auctionId: auctionId,
                    winnerId: userId,
                    finalPrice: auction.buyingPrice
                });


                return { message: "Auction won by paying buying price!"};
            } else{
                return { message: "Auction doesn't have a buying price!"};
            }
        });

        return buyNow;
    },

    async getAuctionBids(auctionId: number, takeNumber: number) {
        const safeAuctionId = Number(auctionId);

        if(!safeAuctionId){
            throw new Error("Auction ID was not given!")
        }

        const result = await prisma.bid.findMany({
            where: { auctionId: safeAuctionId },
            orderBy: { bidAmount: "desc" },
            take: takeNumber,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        })

        return result;
    },
    async getMyBids(userId: number) {
    if (!userId) {
        throw new Error("User ID was not given!");
    }

    const myBids = await prisma.bid.findMany({
        where: { userId: userId },
        orderBy: { bidTime: "desc" },
        include: {
            auction: {
                select: {
                    id: true,
                    title: true,
                    currentPrice: true,
                    status: true,
                    endTime: true
                }
            }
        }
    });

    return myBids;
}
}