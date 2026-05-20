import type { AuctionFilterDTO, CreateAuctionDTO } from "../dto/auction.dto";
import { prisma } from "../db/client";
import type { Auction, WatchCategory } from "../../generated/prisma";
import { auctionTasks } from "../jobs/auction.queues";
import { minioService } from "./minio.service";
import "multer";

function parseSortBy(sortBy: string) {
    switch (sortBy) {
        case "price_asc": return { currentPrice: "asc" as const };
        case "price_desc": return { currentPrice: "desc" as const };
        case "ending_soon": return { endTime: "asc" as const };
        case "newest": 
        default: return { createdAt: "desc" as const };
    }
}

function hideFields(auction: any) {
    if ((auction.auctionType === "FPSB" || auction.auctionType === "VICKREY") && auction.status === "ACTIVE") {
        return {
            ...auction,
            currentPrice: 0,
            bids: [],
        };
    }

    return auction;
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

        if ((data.auctionType === "DUTCH" || data.auctionType === "JAPANESE") && (!data.tickInterval || !data.moneyInterval)) {
            throw new Error("Tick interval and money interval are required for Dutch and Japanese auctions!");
        }

        if (data.auctionType === "DUTCH" && !data.reservePrice) {
            throw new Error("Reserve price (minimum price) is required for Dutch auctions!");
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
                        brand: data.watchItem?.brand ?? "",
                        model: data.watchItem?.model ?? "",
                        material: data.watchItem?.material ?? "",
                        condition: data.watchItem?.condition ?? "",
                        category: data.watchItem?.category ?? "CLOCK",
                        
                        productionYear: data.watchItem?.productionYear ?? null,
                        weight: data.watchItem?.weight ?? null,
                        hasBox: data.watchItem?.hasBox ?? false,
                        hasPapers: data.watchItem?.hasPapers ?? false,
                        isOriginal: data.watchItem?.isOriginal ?? true,

                        ...(data.watchItem?.category === 'WRISTWATCH' && data.watchItem.wristwatch ? {
                        wristwatch: {
                            create: {
                            movementType: data.watchItem.wristwatch.movementType,
                            caseDiameter: data.watchItem.wristwatch.caseDiameter,
                            waterResistance: data.watchItem.wristwatch.waterResistance,
                            strapMaterial: data.watchItem.wristwatch.strapMaterial,
                            glassType: data.watchItem.wristwatch.glassType,
                            }
                        }
                        } : {}),

                        ...(data.watchItem?.category === 'POCKETWATCH' && data.watchItem.pocketWatch ? {
                        pocketWatch: {
                            create: {
                            caseType: data.watchItem.pocketWatch.caseType,
                            movementType: data.watchItem.pocketWatch.movementType,
                            hasChain: data.watchItem.pocketWatch.hasChain,
                            complications: data.watchItem.pocketWatch.complications ?? null, 
                            }
                        }
                        } : {}),

                        ...(data.watchItem?.category === 'SMARTWATCH' && data.watchItem.smartwatch ? {
                        smartwatch: {
                            create: {
                            os: data.watchItem.smartwatch.os,
                            batteryLife: data.watchItem.smartwatch.batteryLife,
                            screenType: data.watchItem.smartwatch.screenType,
                            sensors: data.watchItem.smartwatch.sensors,
                            compatibility: data.watchItem.smartwatch.compatibility,
                            }
                        }
                        } : {}),

                        ...(data.watchItem?.category === 'CLOCK' && data.watchItem.clock ? {
                        clock: {
                            create: {
                            clockType: data.watchItem.clock.clockType,
                            powerSource: data.watchItem.clock.powerSource,
                            dimensions: data.watchItem.clock.dimensions,
                            chimeType: data.watchItem.clock.chimeType ?? null, 
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
                { auctionId: auction.id, userId: user.id, action: "CLOSE" }, 
                { delay: delay, jobId: `close-${auction.id}` }
            );

            switch(auction.auctionType) { 
                case "DUTCH": { 
                    await auctionTasks.add("auction-dutch-job", 
                        { auctionId: auction.id, action: "PRICE_DROP" }, 
                        { delay: (auction.tickInterval || 0) * 1000, jobId: `price-drop-${auction.id}-${Date.now()}` }
                    );
                    break; 
                } 
                case "JAPANESE": { 
                    await auctionTasks.add("auction-japanese-job", 
                        { auctionId: auction.id, action: "PRICE_UP" }, 
                        { delay: (auction.tickInterval || 0) * 1000, jobId: `price-up-${auction.id}-${Date.now()}` }
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

        if(auction?.images){
            await minioService.deleteAuctionPictures(userId,auction?.images);
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

        if ((data.auctionType === "DUTCH" || data.auctionType === "JAPANESE") && (!data.tickInterval || !data.moneyInterval)) {
            throw new Error("Tick interval and money interval are required for Dutch and Japanese auctions!");
        }

        if (data.auctionType === "DUTCH" && !data.reservePrice) {
            throw new Error("Reserve price (minimum price) is required for Dutch auctions!");
        }

        const currentWatchItem = await prisma.watchItem.findUnique({
            where: { auctionId: auctionId }
        });

        if (currentWatchItem && data.watchItem?.category) {
            await prisma.$transaction([
                prisma.wristwatch.deleteMany({ where: { watchItemId: currentWatchItem.id } }),
                prisma.pocketWatch.deleteMany({ where: { watchItemId: currentWatchItem.id } }),
                prisma.smartwatch.deleteMany({ where: { watchItemId: currentWatchItem.id } }),
                prisma.clock.deleteMany({ where: { watchItemId: currentWatchItem.id } }),
            ]);
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
                ...(data.startTime.getTime() > Date.now() ? { status: "UPCOMING" } : { status: "ACTIVE" }),
                reservePrice: data.reservePrice ?? null,
                buyingPrice: data.buyingPrice ?? null,
                tickInterval: data.tickInterval ?? null,
                moneyInterval: data.moneyInterval ?? null,
                isAscending: data.isAscending ?? null,

                watchItem: {
                    update: {
                        brand: data.watchItem?.brand ?? "",
                        model: data.watchItem?.model ?? "",
                        material: data.watchItem?.material ?? "",
                        condition: data.watchItem?.condition ?? "",
                        category: data.watchItem?.category ?? "CLOCK",
                        productionYear: data.watchItem?.productionYear ?? null,
                        weight: data.watchItem?.weight ?? null,
                        hasBox: data.watchItem?.hasBox ?? false,
                        hasPapers: data.watchItem?.hasPapers ?? false,
                        isOriginal: data.watchItem?.isOriginal ?? true,

                        // WRISTWATCH UPSERT
                        ...(data.watchItem?.category === 'WRISTWATCH' && data.watchItem.wristwatch ? {
                            wristwatch: {
                                upsert: {
                                    create: {
                                        movementType: data.watchItem.wristwatch.movementType,
                                        caseDiameter: data.watchItem.wristwatch.caseDiameter,
                                        waterResistance: data.watchItem.wristwatch.waterResistance,
                                        strapMaterial: data.watchItem.wristwatch.strapMaterial,
                                        glassType: data.watchItem.wristwatch.glassType,
                                    },
                                    update: {
                                        movementType: data.watchItem.wristwatch.movementType,
                                        caseDiameter: data.watchItem.wristwatch.caseDiameter,
                                        waterResistance: data.watchItem.wristwatch.waterResistance,
                                        strapMaterial: data.watchItem.wristwatch.strapMaterial,
                                        glassType: data.watchItem.wristwatch.glassType,
                                    }
                                }
                            }
                        } : {}),

                        // POCKETWATCH UPSERT
                        ...(data.watchItem?.category === 'POCKETWATCH' && data.watchItem.pocketWatch ? {
                            pocketWatch: {
                                upsert: {
                                    create: {
                                        caseType: data.watchItem.pocketWatch.caseType,
                                        movementType: data.watchItem.pocketWatch.movementType,
                                        hasChain: data.watchItem.pocketWatch.hasChain,
                                        complications: data.watchItem.pocketWatch.complications ?? null,
                                    },
                                    update: {
                                        caseType: data.watchItem.pocketWatch.caseType,
                                        movementType: data.watchItem.pocketWatch.movementType,
                                        hasChain: data.watchItem.pocketWatch.hasChain,
                                        complications: data.watchItem.pocketWatch.complications ?? null,
                                    }
                                }
                            }
                        } : {}),

                        // SMARTWATCH UPSERT
                        ...(data.watchItem?.category === 'SMARTWATCH' && data.watchItem.smartwatch ? {
                            smartwatch: {
                                upsert: {
                                    create: {
                                        os: data.watchItem.smartwatch.os,
                                        batteryLife: data.watchItem.smartwatch.batteryLife,
                                        screenType: data.watchItem.smartwatch.screenType,
                                        sensors: data.watchItem.smartwatch.sensors,
                                        compatibility: data.watchItem.smartwatch.compatibility,
                                    },
                                    update: {
                                        os: data.watchItem.smartwatch.os,
                                        batteryLife: data.watchItem.smartwatch.batteryLife,
                                        screenType: data.watchItem.smartwatch.screenType,
                                        sensors: data.watchItem.smartwatch.sensors,
                                        compatibility: data.watchItem.smartwatch.compatibility,
                                    }
                                }
                            }
                        } : {}),

                        // CLOCK UPSERT
                        ...(data.watchItem?.category === 'CLOCK' && data.watchItem.clock ? {
                            clock: {
                                upsert: {
                                    create: {
                                        clockType: data.watchItem.clock.clockType,
                                        powerSource: data.watchItem.clock.powerSource,
                                        dimensions: data.watchItem.clock.dimensions,
                                        chimeType: data.watchItem.clock.chimeType ?? null,
                                    },
                                    update: {
                                        clockType: data.watchItem.clock.clockType,
                                        powerSource: data.watchItem.clock.powerSource,
                                        dimensions: data.watchItem.clock.dimensions,
                                        chimeType: data.watchItem.clock.chimeType ?? null,
                                    }
                                }
                            }
                        } : {}),
                    }
                }
            }
        });

        const deleteJob = await auctionTasks.getJob(`close-${auctionId}`)
        if(deleteJob){
            await deleteJob?.remove();
            console.log("Job torolve: ", `${deleteJob.id}`);
        }

        const jobsToClean = await auctionTasks.getJobs(['delayed', 'waiting', 'paused']);

        for (const job of jobsToClean) {
            if (
                job.id?.startsWith(`price-drop-${auctionId}`) || 
                job.id?.startsWith(`price-up-${auctionId}`) || 
                job.id?.startsWith(`start-${auctionId}`)
            ) {
                await job.remove();
                console.log(`Old auction jobs deleted: ${job.id}`);
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
                        { delay: (updated.tickInterval || 0) * 1000, jobId: `price-drop-${updated.id}-${Date.now()}` }
                    );
                    break; 
                } 
                case "JAPANESE": { 
                    await auctionTasks.add("auction-japanese-job", 
                        { auctionId: updated.id, action: "PRICE_UP" }, 
                        { delay: (updated.tickInterval || 0) * 1000, jobId: `price-up-${updated.id}-${Date.now()}` }
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
        const [promoted, trending, latest, smartwatches, clocks, wristwatches, pocketWatches ] = await Promise.all([
            prisma.auction.findMany({ 
                where: { promotedHomeRank: { not: null}, status: "ACTIVE"},
                include: { watchItem: true },
                orderBy: { promotedHomeRank: "asc"},
                take: 10,
            }),
            prisma.trendings.findMany({ 
                where: { updatedAt: { gte: trendingDate }},
                orderBy: { clicks: "desc"},
                take: 20,
                include: { auction: { include: { watchItem: true } } }
            }),
            prisma.auction.findMany({ 
                where: { status: "ACTIVE" },
                orderBy: { startTime: "desc"},
                include: { watchItem: true },
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

        const newPromoted = promoted.map(hideFields);
        const newTrending = trending.map(a => ({...a, auction: hideFields(a.auction)}));
        const newLatest = latest.map(hideFields);
        const newSmartwatches = smartwatches.map(hideFields);
        const newClocks = clocks.map(hideFields);
        const newWristwatches = wristwatches.map(hideFields);
        const newPocketWatches = pocketWatches.map(hideFields);

        return { 
            promoted: newPromoted,
            trending: newTrending, 
            latest: newLatest, 
            smartwatches: newSmartwatches, 
            clocks: newClocks, 
            wristwatches: newWristwatches, 
            pocketWatches: newPocketWatches 
        }
    },
    async addToWatchList(userId: number,auctionId: number) {
        if(!userId){
            throw new Error("User ID not given!")
        }

        if(!auctionId){
            throw new Error("Auction ID not given!")
        }
        try {
            await prisma.watchList.create({
                data: { userId: userId, auctionId: auctionId }
            })

            return { message: "Item successfully added to your watchlist!" };
        } catch (err) {
            throw new Error("Item already in the list!");
        }
    },
    async getWatchList(userId: number) {
        if(!userId){
            throw new Error("User ID not given!")
        }

        const watchList = await prisma.watchList.findMany({
            where: { userId: userId },
            include: { auctions: { include: { watchItem: true } } }
        })

        return watchList.map(entry => hideFields(entry.auctions) ) || [];
    },
    async deleteAuctionFromWatchList(userId: number, auctionId: number) {
        if(!userId){
            throw new Error("User ID not given!")
        }

        if(!auctionId){
            throw new Error("Auction ID not given!")
        }
        try {
            return await prisma.watchList.delete({
                where: { userId_auctionId: { userId, auctionId: auctionId } }
            })
        } catch (err) {
            throw new Error("Item not found on watchlist or already deleted.");
        }
    },
    async getAuctionByCategory(type: WatchCategory){
        const [ promoted, others ] = await Promise.all([
            prisma.auction.findMany({
                where: {
                    promotedCategoryRank: { not: null},
                    status: "ACTIVE",
                    watchItem: {
                        category: type,
                    }
                },
                orderBy: { promotedCategoryRank: "asc"},
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
            }),
            prisma.auction.findMany({
                where: {
                    status: "ACTIVE",
                    watchItem: {
                        category: type,
                    },
                    promotedCategoryRank: null,
                },
                orderBy: { startTime: "desc" },
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
        ]);

        const newPromoted = promoted.map(hideFields);
        const newOthers = others.map(hideFields);
        return {
            promoted: newPromoted,
            others: newOthers
        };
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

        const newResult = result.map(hideFields);

        return newResult;
    },
    async getUserAuctions(userId: number){
        const result = await prisma.auction.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc"},
            include: { 
                watchItem: true
                }
        })

        if(!result){
            throw new Error("User auctions not found!");
        }

        return result;
    },
    async getAuctionById(auctionId: number){
        const result = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { 
                user: {
                    select: {
                        lastName: true,
                        firstName: true,
                        profilePicture: true,
                    }
                },
                bids: {
                    where: {isWinner: true},
                    select: {
                        userId: true
                    }
                },
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

        if ((result.auctionType === "FPSB" || result.auctionType === "VICKREY") && result.status === "ACTIVE") {
            return {
                ...result,
                currentPrice: 0,
                bids: [],
            };
        }

        return result;
    },

    async uploadAuctionFiles(auctionId: number, userId: number, files: Express.Multer.File[]){
        const uploaded = await minioService.uploadAuctionFiles(auctionId,userId,files);
        const images = uploaded.map(img => img.url)

        return await prisma.auction.update({
            where: { id: auctionId},
            data: { images: images},
            include: {
                watchItem: true,
                user: true,
            }
        })
    }
}