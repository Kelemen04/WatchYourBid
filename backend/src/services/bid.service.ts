import type { AutoBidDTO, PlaceBidDTO, PlacePromotingBidDTO } from "../dto/bids.dto";
import { prisma } from '../db/client'
import { io } from "../utils/socket"
import { auctionTasks } from "../jobs/auction.queues";

export const bidService = {
    async placeBid(data: PlaceBidDTO, userId: number, auctionId: number) {
        let dutchAuctionEndedData: any = null;

        const newBid = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    buyer: true,
                }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            if (!user || user.buyer === null) {
                throw new Error("You need a buyer account to make bids!");
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

                dutchAuctionEndedData = {
                    winningBid: winningBid,
                    auctionId: auctionId,
                    winnerId: userId,
                    finalPrice: data.bidAmount
                };

                return winningBid;
            }

            const lastBid = await tx.bid.findFirst({
                where: { auctionId: auctionId },
                orderBy: { bidAmount: "desc" }
            })

            if (auction.auctionType === "JAPANESE") {
                if (data.bidAmount !== auction.currentPrice) {
                    throw new Error("In a Japanese auction, you must bid exactly the current round price!");
                }

                const myBidThisRound = await tx.bid.findFirst({
                    where: { 
                        auctionId: auctionId, 
                        userId: userId, 
                        bidAmount: auction.currentPrice 
                    }
                });

                if (myBidThisRound) {
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

        if (dutchAuctionEndedData) {
            const jobsToClean = await auctionTasks.getJobs(['delayed', 'waiting', 'paused']);
            for (const job of jobsToClean) {
                if (job.id?.startsWith(`price-drop-${auctionId}`) || job.id?.startsWith(`close-${auctionId}`)) {
                    await job.remove();
                }
            }

            io.to(`auction-${auctionId}`).emit("AuctionEnded", {
                auctionId: dutchAuctionEndedData.auctionId,
                winnerId: dutchAuctionEndedData.winnerId,
                finalPrice: dutchAuctionEndedData.finalPrice
            });

            return dutchAuctionEndedData.winningBid;
        }

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
        // today.setHours(0, 0, 0, 0);

        const newBid = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    seller: true
                }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            if(user.seller === null){
                throw new Error("You need a seller account to promote!")
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

            const incrementValue = (data.increment && data.increment > 0) 
                ? data.increment : (auction?.minBidIncrement || 1);

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

            if (auction.auctionType !== "ENGLISH") {
                throw new Error("Auto-bidding is only available for English auctions!");
            }
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    buyer: true,
                }
            })

            if (!user) {
                throw new Error("This user doesn't exist!")
            }

            if(user.buyer === null){
                throw new Error("You need a buyer acount to make bids!")
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

            if (incrementValue < (auction.minBidIncrement || 0)) {
                throw new Error("The given increment is lower than the given minimum increment!");
            }

            await tx.auction.update({
                where: { id: auctionId, currentPrice: auction.currentPrice },
                data: { currentPrice: auction.currentPrice + incrementValue }
            });

            const entry = await tx.autoBid.upsert({
                where: { userId_auctionId: { userId, auctionId } },
                update: { maxAmount: data.maxAmount, increment: incrementValue },
                create: {
                    increment: incrementValue,
                    maxAmount: data.maxAmount as number,
                    userId,
                    auctionId
                }
            });

            await tx.bid.create({
                data: {
                    bidAmount: auction.currentPrice + incrementValue,
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

        await prisma.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            });

            if (!auction || auction.status !== "ACTIVE") return;

            const increment = auction.minBidIncrement || 1;
            const minRequiredBalance = auction.currentPrice + increment;

            const activeAutoBids = await tx.autoBid.findMany({
                where: { 
                    auctionId: auctionId,
                    maxAmount: { gte: minRequiredBalance },
                    user: { balance: { gte: minRequiredBalance } }
                },
                orderBy: [
                    { maxAmount: "desc" },
                    { id: "asc" }
                ]
            });

            if (activeAutoBids.length === 0) return;

            const currentHighestBid = await tx.bid.findFirst({
                where: { auctionId },
                orderBy: { bidAmount: "desc" }
            });

            const currentWinnerId = currentHighestBid?.userId;

            const highestAuto = activeAutoBids[0];
            if (!highestAuto) return;
            const secondHighestAuto = activeAutoBids.length > 1 ? activeAutoBids[1] : null;

            if (highestAuto.userId === currentWinnerId && !secondHighestAuto) {
                return;
            }

            let newPrice = auction.currentPrice;
            let winnerId = currentWinnerId;
            const bidsToInsert = [];

            if (secondHighestAuto && secondHighestAuto.userId !== highestAuto.userId) {
                const secondMax = secondHighestAuto.maxAmount;
                const jumpPrice = Math.min(
                    highestAuto.maxAmount,
                    secondMax + (highestAuto.increment || increment)
                );

                if (jumpPrice > auction.currentPrice) {
                    bidsToInsert.push({
                        bidAmount: secondMax,
                        userId: secondHighestAuto.userId,
                        auctionId: auctionId,
                        autoBidId: secondHighestAuto.id
                    });

                    bidsToInsert.push({
                        bidAmount: jumpPrice,
                        userId: highestAuto.userId,
                        auctionId: auctionId,
                        autoBidId: highestAuto.id
                    });

                    newPrice = jumpPrice;
                    winnerId = highestAuto.userId;
                }
            } else {
                if (highestAuto.userId !== currentWinnerId) {
                    const jumpPrice = auction.currentPrice + (highestAuto.increment || increment);
                    
                    if (jumpPrice <= highestAuto.maxAmount) {
                        bidsToInsert.push({
                            bidAmount: jumpPrice,
                            userId: highestAuto.userId,
                            auctionId: auctionId,
                            autoBidId: highestAuto.id
                        });
                        newPrice = jumpPrice;
                        winnerId = highestAuto.userId;
                    }
                }
            }

            if (bidsToInsert.length > 0) {
                await tx.auction.update({
                    where: { id: auctionId },
                    data: { currentPrice: newPrice }
                });

                await tx.bid.createMany({
                    data: bidsToInsert
                });

                autoBidDetails = { 
                    auctionId, 
                    newPrice, 
                    bidderId: winnerId, 
                    isAutoBid: true 
                };
            }
        });

        // Kiküldjük a socket eseményt a háború VÉGÉN (így csak 1 villanás van a frontend-en)
        if (autoBidDetails) {
            io.to(`auction-${auctionId}`).emit("BidUpdated", autoBidDetails);
        }
    },

    async buyNow(userId: number, auctionId: number){
        const transactionData = await prisma.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({
                where: { id: auctionId }
            })

            if (!auction) {
                throw new Error("This auction doesn't exist!")
            }

            if(auction.buyingPrice){
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    include: {
                        buyer: true
                    }
                })

                if (!user) {
                    throw new Error("This user doesn't exist!")
                }

                if(user.buyer === null){
                    throw new Error("You need a buyer account to make bids!")
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

                const winningBid = await tx.bid.create({
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

                return { isSuccess: true, buyingPrice: auction.buyingPrice };
            } else {
                return { isSuccess: false };
            }
        });

        if (transactionData.isSuccess) {
            const delayedJobs = await auctionTasks.getDelayed();
            for (const job of delayedJobs) {
                if (job.id?.startsWith(`price-drop-${auctionId}`) || job.id?.startsWith(`price-up-${auctionId}`) || job.id?.startsWith(`close-${auctionId}`)) {
                    await job.remove();
                }
            }

            io.to(`auction-${auctionId}`).emit("AuctionEnded", {
                auctionId: auctionId,
                winnerId: userId,
                finalPrice: transactionData.buyingPrice
            });

            return { message: "Auction won by paying buying price!"};
        } else {
            return { message: "Auction doesn't have a buying price!"};
        }
    },

    async getAuctionBids(auctionId: number, takeNumber: number) {
        const safeAuctionId = Number(auctionId);

        if(!safeAuctionId){
            throw new Error("Auction ID was not given!")
        }

        const auction = await prisma.auction.findUnique({
            where: { id: safeAuctionId }
        });

        if (!auction) throw new Error("Auction not found!");

        if ((auction.auctionType === "FPSB" || auction.auctionType === "VICKREY") && auction.status === "ACTIVE") {
            return [];
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
    async getMyBids(userId: number, skip: number, take: number) {
        if (!userId) {
            throw new Error("User ID was not given!");
        }

        const myBids = await prisma.bid.findMany({
            where: { userId: userId },
            orderBy: { bidTime: "desc" },
            skip: skip,
            take: take,
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