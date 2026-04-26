import type { CreateAuctionDTO } from "../dto/auction.dto";
import { prisma } from "../db/client";
import type { WatchCategory } from "../../generated/prisma";
import { networkInterfaces } from "os";

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

                        // --- Wristwatch ---
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

                        // --- Smartwatch ---
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

        return { message: "Auction created successfully", auction}
    },
    async deleteAuction(auctionId: number, userId: number){
        const auction = await prisma.auction.findUnique({
            where: {id: auctionId}
        })

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(auction?.userId !== userId && user?.role != "ADMIN" && user?.role != "MODERATOR"){
            throw new Error("You don't have permission to delete this auction!")
        }

        const hasBids = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { _count: { select: { bids: true } } }
        })

        if(!hasBids){
            throw new Error("Auction not found!");
        }

        const bidCount = hasBids._count?.bids ?? 0;

        if (bidCount > 0) {
            throw new Error("You can't delete an auction that has active bids!");
        }

        await prisma.auction.delete({
            where: { id: auctionId}
        })

        return { message: "Auction deletion completed successfully!"}
    },
    async updateAuction(auctionId: number, userId: number, data: CreateAuctionDTO){
        const auction = await prisma.auction.findUnique({
            where: {id: auctionId}
        })

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(auction?.userId !== userId){
            throw new Error("You don't have permission to update this auction!")
        }

        const hasBids = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { _count: { select: { bids: true } } }
        })

        if(!hasBids){
            throw new Error("Auction not found!");
        }

        const bidCount = hasBids._count?.bids ?? 0;

        if (bidCount > 0) {
            throw new Error("You can't delete an auction that has active bids!");
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

                        // --- Wristwatch ---
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

                        // --- Smartwatch ---
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

        return { message: "Auction updated successfully!"}
    },
    async getHomeAuctions(){
        const trendingDate = new Date(Date.now() - (1000 * 60 * 60 * 24));
        const [trending, latest, smartwatches, clocks, wristwatches, pocketWatches ] = await Promise.all([
            prisma.trendings.findMany({ 
                where: { updatedAt: { gte: trendingDate }},
                orderBy: { clicks: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                orderBy: { startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { 
                    watchItem: {
                        category: "SMARTWATCH"
                    }
                },
                include: { watchItem: true },
                orderBy: {startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { 
                    watchItem: {
                        category: "CLOCK"
                    }
                },
                include: { watchItem: true },
                orderBy: {startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { 
                    watchItem: {
                        category: "WRISTWATCH"
                    }
                },
                include: { watchItem: true },
                orderBy: {startTime: "desc"},
                take: 20,
            }),
            prisma.auction.findMany({ 
                where: { 
                    watchItem: {
                        category: "POCKETWATCH"
                    }
                },
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
    async getAuctionByFilters(filters: any) {
        const now = new Date();

        const result = await prisma.auction.findMany({
            where: {
                status: "ACTIVE",
                
                ...(filters.searchTerm ? {
                    OR: [
                    { title: { contains: filters.searchTerm, mode: "insensitive" } },
                    { description: { contains: filters.searchTerm, mode: "insensitive" } },
                    { watchItem: { brand: { contains: filters.searchTerm, mode: "insensitive" } } },
                    { watchItem: { model: { contains: filters.searchTerm, mode: "insensitive" } } },
                    ]
                } : {}),
                currentPrice: {
                    gte: filters.minPrice ?? undefined,
                    lte: filters.maxPrice ?? undefined,
                },
                auctionType: filters.auctionType ?? undefined,
                buyingPrice: filters.onlyWithBuyingPrice ? { not: null } : undefined,

                endTime: filters.endingSoon ? {
                    gte: now,
                    lte: new Date(now.getTime() + 24 * 60 * 60 * 1000)
                } : { gte: now },

                watchItem: {
                    category: filters.category ?? undefined,
                    brand: filters.brand?.length > 0 ? { in: filters.brand } : undefined,
                    condition: filters.condition?.length > 0 ? { in: filters.condition } : undefined,
                    material: filters.material?.length > 0 ? { in: filters.material } : undefined,
                    productionYear: {
                    gte: filters.minYear ?? undefined,
                    lte: filters.maxYear ?? undefined,
                    },
                    
                    // Mélyebb szűrők (Karóra specifikus)
                    wristwatch: (filters.movementType?.length > 0 || filters.minCaseDiameter || filters.maxCaseDiameter) ? {
                    movementType: filters.movementType?.length > 0 ? { in: filters.movementType } : undefined,
                    caseDiameter: {
                        gte: filters.minCaseDiameter ?? undefined,
                        lte: filters.maxCaseDiameter ?? undefined,
                    }
                    } : undefined
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

            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
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

        return result;
    }
}