import type { AuctionFilterDTO, CreateAuctionDTO } from "../dto/auction.dto";
import { prisma } from "../db/client";
import type { WatchCategory } from "../../generated/prisma";
import { auctionTasks } from "../jobs/auction.queues";
import { de } from "zod/locales";

function parseSortBy(sortBy: string) {
    switch (sortBy) {
        case "price_asc": return { currentPrice: "asc" as const };
        case "price_desc": return { currentPrice: "desc" as const };
        case "ending_soon": return { endTime: "asc" as const };
        case "newest": 
        default: return { createdAt: "desc" as const };
    }
}

export const auctionService = {
    async createAuction(data: CreateAuctionDTO, userId: number){
        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: { seller: true},
        })

        if (!user) {
            throw new Error("User not found!");
        }

        if(user?.status !== 'VERIFIED'){
            throw new Error("Your account must be verified before creating auctions!")
        }

        if(!user.seller){
            throw new Error("A seller account needed before creating an auction!")
        }

        const auction = await prisma.auction.create({
            data: {
                title: data.title,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                startingPrice: data.startingPrice,
                currentPrice: data.startingPrice,
                auctionType: data.auctionType,
                userId: userId,
                status: data.startTime.getTime() > Date.now() ? "UPCOMING" : "ACTIVE",

                reservePrice: data.reservePrice ?? null,
                buyingPrice: data.buyingPrice ?? null,
                tickInterval: data.tickInterval ?? null,
                moneyInterval: data.moneyInterval ?? null,
                isAscending: data.isAscending ?? null,

                watchItem: {
                    create: {
                        brand: data.brand,
                        model: data.model,
                        material: data.material,
                        condition: data.condition,
                        category: data.category,
                        
                        productionYear: data.productionYear ?? null,
                        weight: data.weight ?? null,
                        hasBox: data.hasBox ?? false,
                        hasPapers: data.hasPapers ?? false,
                        isOriginal: data.isOriginal ?? true,

                        ...(data.category === 'WRISTWATCH' && data.wristwatch ? {
                        wristwatch: {
                            create: {
                            movementType: data.wristwatch.movementType,
                            caseDiameter: data.wristwatch.caseDiameter,
                            waterResistance: data.wristwatch.waterResistance,
                            strapMaterial: data.wristwatch.strapMaterial,
                            glassType: data.wristwatch.glassType,
                            }
                        }
                        } : {}),

                        ...(data.category === 'POCKETWATCH' && data.pocketWatch ? {
                        pocketWatch: {
                            create: {
                            caseType: data.pocketWatch.caseType,
                            movementType: data.pocketWatch.movementType,
                            hasChain: data.pocketWatch.hasChain,
                            complications: data.pocketWatch.complications ?? null, 
                            }
                        }
                        } : {}),

                        ...(data.category === 'SMARTWATCH' && data.smartwatch ? {
                        smartwatch: {
                            create: {
                            os: data.smartwatch.os,
                            batteryLife: data.smartwatch.batteryLife,
                            screenType: data.smartwatch.screenType,
                            sensors: data.smartwatch.sensors,
                            compatibility: data.smartwatch.compatibility,
                            }
                        }
                        } : {}),

                        ...(data.category === 'CLOCK' && data.clock ? {
                        clock: {
                            create: {
                            clockType: data.clock.clockType,
                            powerSource: data.clock.powerSource,
                            dimensions: data.clock.dimensions,
                            chimeType: data.clock.chimeType ?? null, 
                            }
                        }
                        } : {}),
                    }
                }
            }
        })

        if (auction.status === "ACTIVE") {
            const date = new Date().getTime();
            const date2 = auction.endTime.getTime();
            const delay = Math.max(0, date2 - date);

            await auctionTasks.add("auction-close-job", 
                { auctionId: auction.id, action: "CLOSE" }, 
                { delay: delay, jobId: `close-${auction.id}` }
            );

            switch(auction.auctionType) { 
                case "DUTCH": { 
                    await auctionTasks.add("auction-dutch-job", 
                        { auctionId: auction.id, action: "PRICE_DROP" }, 
                        { delay: auction.tickInterval || 0, jobId: `price-drop-${auction.id}-${Date.now()}` }
                    );
                    break; 
                } 
                case "JAPANESE": { 
                    await auctionTasks.add("auction-japanese-job", 
                        { auctionId: auction.id, action: "PRICE_UP" }, 
                        { delay: auction.tickInterval || 0, jobId: `price-up-${auction.id}-${Date.now()}` }
                    );
                    break; 
                }
            }
        } else if (auction.status === "UPCOMING") {
            const startDelay = Math.max(0, auction.startTime.getTime() - Date.now());
            await auctionTasks.add("auction-start-job", 
                { auctionId: auction.id, action: "START" }, 
                { delay: startDelay, jobId: `start-${auction.id}` }
            );
        }

        return { message: "Auction created successfully", auction}
    },
    async deleteAuction(auctionId: number, userId: number){
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { _count: { select: { bids: true } } }
        })

        if(!auction){
            throw new Error("Auction not found!");
        }

        if(auction.userId !== userId && user?.role != "ADMIN" && user?.role != "MODERATOR"){
            throw new Error("You don't have permission to delete this auction!")
        }

        if (auction._count.bids > 0) {
            throw new Error("You can't delete an auction that has active bids!");
        }

        await prisma.auction.delete({
            where: { id: auctionId}
        })

        const deleteJob = await auctionTasks.getJob(`close-${auctionId}`)
        if(deleteJob){
            await deleteJob?.remove();
            console.log("Job torolve: ", `${deleteJob.id}`);
        }

        const delayedJobs = await auctionTasks.getDelayed();
        for (const job of delayedJobs) {
            if (job.id?.startsWith(`price-drop-${auctionId}`) || job.id?.startsWith(`price-up-${auctionId}`) || job.id?.startsWith(`start-${auctionId}`)) {
            await job.remove();
            console.log(`Japanese or dutch job deleted: ${job.id}`);
            }
        }

        return { message: "Auction deletion completed successfully!"}
    },
    async updateAuction(auctionId: number, userId: number, data: CreateAuctionDTO){
        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { _count: { select: { bids: true } } }
        })

        if(!auction){
            throw new Error("Auction not found!");
        }

        if(auction.userId !== userId){
            throw new Error("You don't have permission to update this auction!")
        }

        if (auction._count.bids > 0) {
            throw new Error("You can't update an auction that has active bids!");
        }

        const updated = await prisma.auction.update({
            where: { id: auctionId },
            data: {
                title: data.title,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                startingPrice: data.startingPrice,
                currentPrice: data.startingPrice,
                auctionType: data.auctionType,
                userId: userId,
                ...(data.startTime.getTime() > Date.now() ?{ status: "UPCOMING" } : {status: "ACTIVE"} ),
                reservePrice: data.reservePrice ?? null,
                buyingPrice: data.buyingPrice ?? null,
                tickInterval: data.tickInterval ?? null,
                moneyInterval: data.moneyInterval ?? null,
                isAscending: data.isAscending ?? null,

                watchItem: {
                    update: {
                        brand: data.brand,
                        model: data.model,
                        material: data.material,
                        condition: data.condition,
                        category: data.category,
                        
                        productionYear: data.productionYear ?? null,
                        weight: data.weight ?? null,
                        hasBox: data.hasBox ?? false,
                        hasPapers: data.hasPapers ?? false,
                        isOriginal: data.isOriginal ?? true,

                        ...(data.category === 'WRISTWATCH' && data.wristwatch ? {
                        wristwatch: {
                            create: {
                            movementType: data.wristwatch.movementType,
                            caseDiameter: data.wristwatch.caseDiameter,
                            waterResistance: data.wristwatch.waterResistance,
                            strapMaterial: data.wristwatch.strapMaterial,
                            glassType: data.wristwatch.glassType,
                            }
                        }
                        } : {}),

                        ...(data.category === 'POCKETWATCH' && data.pocketWatch ? {
                        pocketWatch: {
                            create: {
                            caseType: data.pocketWatch.caseType,
                            movementType: data.pocketWatch.movementType,
                            hasChain: data.pocketWatch.hasChain,
                            complications: data.pocketWatch.complications ?? null, 
                            }
                        }
                        } : {}),

                        ...(data.category === 'SMARTWATCH' && data.smartwatch ? {
                        smartwatch: {
                            create: {
                            os: data.smartwatch.os,
                            batteryLife: data.smartwatch.batteryLife,
                            screenType: data.smartwatch.screenType,
                            sensors: data.smartwatch.sensors,
                            compatibility: data.smartwatch.compatibility,
                            }
                        }
                        } : {}),

                        ...(data.category === 'CLOCK' && data.clock ? {
                        clock: {
                            create: {
                            clockType: data.clock.clockType,
                            powerSource: data.clock.powerSource,
                            dimensions: data.clock.dimensions,
                            chimeType: data.clock.chimeType ?? null, 
                            }
                        }
                        } : {}),
                    }
                }
            }
        })

        const deleteJob = await auctionTasks.getJob(`close-${auctionId}`)
        if(deleteJob){
            await deleteJob?.remove();
            console.log("Job torolve: ", `${deleteJob.id}`);
        }

        const delayedJobs = await auctionTasks.getDelayed();
        for (const job of delayedJobs) {
            if (job.id?.startsWith(`price-drop-${auctionId}`) || job.id?.startsWith(`price-up-${auctionId}`) || job.id?.startsWith(`start-${auctionId}`)) {
            await job.remove();
            console.log(`Japanese or dutch job deleted: ${job.id}`);
            }
        }

        if (updated.status === "ACTIVE") {
            const date = new Date().getTime();
            const date2 = updated.endTime.getTime();
            const delay = Math.max(0, date2 - date);

            await auctionTasks.add("auction-close-job", 
                { auctionId: updated.id, action: "CLOSE" }, 
                { delay: delay, jobId: `close-${updated.id}` }
            );

            switch(updated.auctionType) { 
                case "DUTCH": { 
                    await auctionTasks.add("auction-dutch-job", 
                        { auctionId: updated.id, action: "PRICE_DROP" }, 
                        { delay: updated.tickInterval || 0, jobId: `price-drop-${updated.id}-${Date.now()}` }
                    );
                    break; 
                } 
                case "JAPANESE": { 
                    await auctionTasks.add("auction-japanese-job", 
                        { auctionId: updated.id, action: "PRICE_UP" }, 
                        { delay: updated.tickInterval || 0, jobId: `price-up-${updated.id}-${Date.now()}` }
                    );
                    break; 
                }
            }
        } else if (updated.status === "UPCOMING") {
            const startDelay = Math.max(0, updated.startTime.getTime() - Date.now());
            await auctionTasks.add("auction-start-job", 
                { auctionId: updated.id, action: "START" }, 
                { delay: startDelay, jobId: `start-${updated.id}` }
            );
        }

        return { message: "Auction updated successfully!"}
    },
    async getHomeAuctions(){
        const trendingDate = new Date(Date.now() - (1000 * 60 * 60 * 24));
        const [trending, latest, smartwatches, clocks, wristwatches, pocketWatches ] = await Promise.all([
            prisma.trendings.findMany({ 
                where: { updatedAt: { gte: trendingDate }},
                orderBy: { clicks: "desc"},
                take: 20,
                include: { auction: true }
            }),
            prisma.auction.findMany({ 
                orderBy: { startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { watchItem: { category: "SMARTWATCH" } },
                include: { watchItem: true },
                orderBy: {startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { watchItem: { category: "CLOCK" } },
                include: { watchItem: true },
                orderBy: {startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { watchItem: { category: "WRISTWATCH" } },
                include: { watchItem: true },
                orderBy: {startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { watchItem: { category: "POCKETWATCH" } },
                include: { watchItem: true },
                orderBy: {startTime: "desc"},
                take: 20,
            }),
        ])

        return { trending, latest, smartwatches, clocks, wristwatches, pocketWatches }
    },
    async getAuctionByCategory(type: WatchCategory){
        const result = await prisma.auction.findMany({
            where: {
                status: "ACTIVE",
                watchItem: {
                    category: type,
                }
            },
            include: {
                watchItem: {
                    include: {
                        wristwatch: true,
                        smartwatch: true,
                        pocketWatch: true,
                        clock: true
                    }
                }
            }
        })

        return result;
    },
    async getAuctionByFilters(filters: AuctionFilterDTO) {
        const result = await prisma.auction.findMany({
            where: {
                status: "ACTIVE",
                ...(filters.searchTerm ? {
                    OR: [
                        { title: { contains: filters.searchTerm, mode: "insensitive" } },
                        { description: { contains: filters.searchTerm, mode: "insensitive" } },
                        { watchItem: { brand: { contains: filters.searchTerm, mode: "insensitive" } } },
                        { watchItem: { model: { contains: filters.searchTerm, mode: "insensitive" } } },
                    ],
                } : {}),
                currentPrice: {
                    gte: filters.minPrice,
                    lte: filters.maxPrice,
                },
                auctionType: filters.auctionType,
                watchItem: {
                    category: filters.category,
                    brand: filters.brand,
                    condition: filters.condition,
                    material: filters.material,
                    ...(filters.minYear !== undefined || filters.maxYear !== undefined ? {
                        productionYear: {
                            gte: filters.minYear,
                            lte: filters.maxYear,
                        }
                    } : {}),
                }
            },
            include: {
                watchItem: {
                    include: {
                        wristwatch: true,
                        smartwatch: true,
                        pocketWatch: true,
                        clock: true
                    }
                }
            },
            orderBy: parseSortBy(filters.sortBy),
            skip: filters.skip,
            take: filters.take,
        });

        return result;
    },
    async getAuctionById(auctionId: number){
        const result = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { 
                watchItem: {
                    include: {
                        smartwatch: true,
                        pocketWatch: true,
                        wristwatch: true,
                        clock: true,
                    }
                }
            }
        })

        if(!result){
            throw new Error("Auction not found!");
        }

        return result;
    }
}