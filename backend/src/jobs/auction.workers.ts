import { Job, Worker } from "bullmq";
import { auctionTasks } from "./auction.queues";
import { prisma } from "../db/client";
import { connection } from "../db/connect";

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
            break;
        }

        case "CLOSE": {
            await prisma.auction.update({
                where: { id: job.data.auctionId },
                data: { status: "ENDED" }
            });
            
            console.log(`Auction ${job.data.auctionId} has been closed (ENDED).`);
            break;
        }
    }
}, { connection: connection });