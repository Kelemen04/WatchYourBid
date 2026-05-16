import { Job, Worker } from "bullmq";
import { auctionTasks, promotingTasks } from "./auction.queues";
import { prisma } from "../db/client";
import { connection } from "../db/connect";
import { io } from "../utils/socket";

export const worker = new Worker("auctionTasks", async (job: Job) => {
    const auctionData = await prisma.auction.findUnique({
        where: { id: job.data.auctionId }
    });

    if (!auctionData || (job.data.action !== "START" && auctionData.status !== "ACTIVE")) {
        return;
    }

    switch(job.data.action) {
        case "START": {
            const auction = await prisma.auction.update({
                where: { id: job.data.auctionId },
                data: { status: "ACTIVE" }
            });

            const delay = Math.max(0, auction.endTime.getTime() - Date.now());
            await auctionTasks.add("auction-close-job", 
                { auctionId: auction.id, action: "CLOSE" }, 
                { delay: delay, jobId: `close-${auction.id}` }
            );

            if (auction.auctionType === "DUTCH") {
                await auctionTasks.add("auction-dutch-job", 
                    { auctionId: auction.id, action: "PRICE_DROP" }, 
                    { delay: auction.tickInterval || 0, jobId: `price-drop-${auction.id}-${Date.now()}` }
                );
            } else if (auction.auctionType === "JAPANESE") {
                await auctionTasks.add("auction-japanese-job", 
                    { auctionId: auction.id, action: "PRICE_UP" }, 
                    { delay: auction.tickInterval || 0, jobId: `price-up-${auction.id}-${Date.now()}` }
                );
            }

            io.to(`auction-${auction.id}`).emit("AuctionStarted", {
                auctionId: auction.id,
            });

            break;
        }

        case "PRICE_DROP": {
            const nextPrice = Math.max(
                auctionData.reservePrice || 0,
                (auctionData.currentPrice || 0) - (auctionData.moneyInterval || 0)
            );

            const updated = await prisma.auction.update({
                where: { id: job.data.auctionId },
                data: { currentPrice: nextPrice }
            });

            if (updated.currentPrice > (updated.reservePrice || 0) && updated.endTime > new Date()) {
                await auctionTasks.add("auction-dutch-job", 
                    { auctionId: updated.id, action: "PRICE_DROP" }, 
                    { delay: updated.tickInterval || 0, jobId: `price-drop-${updated.id}-${Date.now()}` }
                );
            }

            io.to(`auction-${updated.id}`).emit("BidUpdated", {
                auctionId: updated.id,
                newPrice: updated.currentPrice,
            });

            break;
        }

        case "PRICE_UP": {
            const updated = await prisma.auction.update({
                where: { id: job.data.auctionId },
                data: { currentPrice: (auctionData.currentPrice || 0) + (auctionData.moneyInterval || 0) }
            });

            if (updated.endTime > new Date()) {
                await auctionTasks.add("auction-japanese-job", 
                    { auctionId: updated.id, action: "PRICE_UP" }, 
                    { delay: updated.tickInterval || 0, jobId: `price-up-${updated.id}-${Date.now()}` }
                );
            }

            io.to(`auction-${updated.id}`).emit("BidUpdated", {
                auctionId: updated.id,
                newPrice: updated.currentPrice,
            });
            break;
        }

        case "CLOSE": {
            const auction = await prisma.auction.update({
                where: { id: job.data.auctionId },
                data: { status: "ENDED" }
            });

            const winner = await prisma.bid.findFirst({
                    where: { auctionId: auction.id },
                    orderBy: { bidAmount: "desc"},
                })

            if(winner){
                await prisma.bid.update({
                    where: { id: winner.id },
                    data: { isWinner: true }
                })
            }

            io.to(`auction-${auction.id}`).emit("AuctionEnded", {
                    auctionId: auction.id,
                    winnerId: winner?.userId,
                    finalPrice: winner?.bidAmount
                });
            
            console.log(`Auction ${job.data.auctionId} has been closed (ENDED).`);
            break;
        }
    }
}, { connection: connection });

export const promotingWorker = new Worker("promotingTasks", async (job: Job) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.auction.updateMany({
        data: { promotedHomeRank: null, promotedCategoryRank: null }
    });

    const bids = await prisma.promotingBids.findMany({
        where: { targetDate: { gte: yesterday, lt: today} },
        orderBy: { maxAmount: "desc"},
        include: {
            auction: { include: { watchItem: true } }
        }
    })

    if (bids.length === 0) {
        console.log("Nem érkezett hirdetési licit a tegnapi napon.");
        return;
    }

    const topHomeBids = bids.slice(0, 10);

    for (let index = 0; index < topHomeBids.length; index++) {
        const b = topHomeBids[index];
        
        if (!b) continue;

        await prisma.auction.update({
            where: { id: b.auctionId },
            data: { promotedHomeRank: index + 1 }
        });
    }

    let smartwatchIndex = 1;
    let wristwatchIndex = 1;
    let pocketwatchIndex = 1;
    let clockIndex = 1;
    let bidIndex = 0;

    while( smartwatchIndex < 11 || wristwatchIndex < 11 || pocketwatchIndex < 11 || clockIndex < 11) {
        const b = bids[bidIndex];
        
        if (!b) break;

        if( b.auction.watchItem?.category === "POCKETWATCH" && pocketwatchIndex < 11) {
            await prisma.auction.update({
                where: { id: b.auctionId },
                data: { promotedCategoryRank: pocketwatchIndex }
            });
            pocketwatchIndex++;
        } else if( b.auction.watchItem?.category === "WRISTWATCH" && wristwatchIndex < 11) {
            await prisma.auction.update({
                where: { id: b.auctionId },
                data: { promotedCategoryRank: wristwatchIndex }
            });
            wristwatchIndex++;
        } else  if( b.auction.watchItem?.category === "SMARTWATCH" && smartwatchIndex < 11) {
            await prisma.auction.update({
                where: { id: b.auctionId },
                data: { promotedCategoryRank: smartwatchIndex }
            });
            smartwatchIndex++;
        } else if( b.auction.watchItem?.category === "CLOCK" && clockIndex < 11) {
            await prisma.auction.update({
                where: { id: b.auctionId },
                data: { promotedCategoryRank: clockIndex }
            });
            clockIndex++;
        }

        bidIndex++;
    }

    await prisma.promotingBids.deleteMany({
        where: { targetDate: { lt: today} },
    })

}, { connection: connection });