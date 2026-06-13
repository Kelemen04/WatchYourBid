import { prisma } from "../db/client"
import type { BuyerRegisterDTO, SellerRegisterDTO, MeResponse, UpdateUser, PublicProfileDTO } from "../dto/user.dto";
import { minioService } from "./minio.service";

export const userService = {
    async getMe(userId: number) {
        if (!userId) {
            throw new Error("No user id was given")
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                profilePicture: true,
                balance: true,
                buyer: {
                    select: {
                        id: true,
                        userId: true,
                        shippingAddressId: true,
                        shippingAddress: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        userId: true,
                        addressId: true,
                        rating: true,
                        description: true,
                        address: true
                    }
                }
            }
        });

        if (!user) {
            throw new Error("No user found!")
        }

        return user as MeResponse;
    },

    async getUserById(userId: number) {
        if (!userId) {
            throw new Error("No user id was given")
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                seller: { select: { address: true, description: true, rating: true } },
            }
        });

        if (!user) {
            throw new Error("No user found!")
        }

        return user as PublicProfileDTO;
    },

    async updateMe(data: UpdateUser, userId: number) {
        const updateData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
        );

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        return updated;
    },

   async deleteMe(userId: number) {
    try {
        const userContext = await prisma.user.findUnique({
            where: { id: userId },
            include: { buyer: true, seller: true }
        });

        if (!userContext) throw new Error("User not found!");

        // 1. Üzleti szabály: Ha van aukciója vagy licitje, ne töröljön
        const hasAnyAuction = await prisma.auction.findFirst({ where: { userId: userId } });
        const hasAnyBid = await prisma.bid.findFirst({ where: { userId: userId } });

        if (hasAnyAuction || hasAnyBid) {
            throw new Error("You can't delete your account because you have auction or bidding history!");
        }

        // 2. Tranzakció: A törlést a "levelektől" indulva a User felé haladva végezzük
        await prisma.$transaction(async (tx) => {
            // Töröljük a kapcsolatokat
            await tx.review.deleteMany({ where: { authorId: userId } });
            
            // Töröljük a Buyer/Seller rekordokat
            await tx.buyer.deleteMany({ where: { userId: userId } });
            await tx.seller.deleteMany({ where: { userId: userId } });
            
            // Töröljük a címeket (ha léteznek)
            if (userContext.buyer?.shippingAddressId) {
                await tx.address.deleteMany({ where: { id: userContext.buyer.shippingAddressId } });
            }
            if (userContext.seller?.addressId) {
                await tx.address.deleteMany({ where: { id: userContext.seller.addressId } });
            }
            
            // Végül töröljük a usert
            await tx.user.delete({ where: { id: userId } });
        });

        // 3. Kép törlése (tranzakción kívül, mert ez külső rendszer)
        if (userContext.profilePicture) {
            await minioService.deleteUserProfilePicture(userId, userContext.profilePicture);
        }

        return { message: "User deleted successfully!" };
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Failed to delete account. Please contact support.");
    }
},

    async registerBuyer(data: BuyerRegisterDTO, userId: number) {
        try {
            if (!userId) throw new Error("No user id was given");

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { buyer: true }
            });

            if (user?.buyer) throw new Error("You are already registered as a buyer!");

            const existing = await prisma.user.findFirst({
                where: {
                    phoneNumber: data.phoneNumber,
                    NOT: { id: userId }
                },
            });

            if (existing) throw new Error("Phone number already exists!");

            return await prisma.$transaction(async (tx) => {
                return await tx.user.update({
                    where: { id: userId },
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        phoneNumber: data.phoneNumber,
                        ...(data.profilePicture ? { profilePicture: data.profilePicture } : {}),
                        buyer: {
                            create: {
                                shippingAddress: {
                                    create: {
                                        country: data.country,
                                        region: data.region,
                                        city: data.city,
                                        street: data.street,
                                        number: data.number,
                                        zipCode: data.zipCode,
                                        building: data.building ?? null,
                                        floor: data.floor ?? null,
                                        apartment: data.apartment ?? null,
                                    }
                                }
                            }
                        }
                    },
                    include: { buyer: { include: { shippingAddress: true } } }
                });
            });
        } catch (e: any) {
            throw new Error(e.message || "Buyer registration failed");
        }
    },

    async registerSeller(data: SellerRegisterDTO, userId: number) {
        try {
            if (!userId) throw new Error("No user id was given");

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { seller: true }
            });

            if (user?.seller) throw new Error("You are already registered as a seller!");

            const existing = await prisma.user.findFirst({
                where: {
                    phoneNumber: data.phoneNumber,
                    NOT: { id: userId }
                },
            });

            if (existing) throw new Error("Phone number already exists!");

            return await prisma.$transaction(async (tx) => {
                return await tx.user.update({
                    where: { id: userId },
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        phoneNumber: data.phoneNumber,
                        ...(data.profilePicture ? { profilePicture: data.profilePicture } : {}),
                        seller: {
                            create: {
                                description: data.description,
                                address: {
                                    create: {
                                        country: data.country,
                                        region: data.region,
                                        city: data.city,
                                        street: data.street,
                                        number: data.number,
                                        zipCode: data.zipCode,
                                        building: data.building ?? null,
                                        floor: data.floor ?? null,
                                        apartment: data.apartment ?? null,
                                    }
                                }
                            }
                        }
                    },
                    include: { seller: { include: { address: true } } }
                });
            });
        } catch (e: any) {
            throw new Error(e.message || "Seller registration failed");
        }
    },

    async updateBuyer(data: BuyerRegisterDTO, userId: number) {
        if (!userId) throw new Error("No user id was given");

        // Ellenőrizzük, hogy létezik-e a buyer profil
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { buyer: true }
        });

        if (!user || !user.buyer) {
            throw new Error("Buyer profile not found!");
        }

        return await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                // A profilképet a külön upload végpont kezeli, de ha stringként jön, frissíthetjük:
                ...(data.profilePicture && { profilePicture: data.profilePicture }),
                
                buyer: {
                    update: {
                        shippingAddress: {
                            update: {
                                country: data.country,
                                region: data.region,
                                city: data.city,
                                street: data.street,
                                number: data.number,
                                zipCode: data.zipCode,
                                building: data.building ?? null,
                                floor: data.floor ?? null,
                                apartment: data.apartment ?? null,
                            }
                        }
                    }
                }
            },
            include: { buyer: { include: { shippingAddress: true } } }
        });
    },

    async updateSeller(data: SellerRegisterDTO, userId: number) {
        if (!userId) throw new Error("No user id was given");

        // Ellenőrizzük, hogy létezik-e a seller profil
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { seller: true }
        });

        if (!user || !user.seller) {
            throw new Error("Seller profile not found!");
        }

        return await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                ...(data.profilePicture && { profilePicture: data.profilePicture }),
                
                seller: {
                    update: {
                        description: data.description,
                        address: {
                            update: {
                                country: data.country,
                                region: data.region,
                                city: data.city,
                                street: data.street,
                                number: data.number,
                                zipCode: data.zipCode,
                                building: data.building ?? null,
                                floor: data.floor ?? null,
                                apartment: data.apartment ?? null,
                            }
                        }
                    }
                }
            },
            include: { seller: { include: { address: true } } }
        });
    },

    async uploadUserFile(userId: number, file: Express.Multer.File) {
        if (!userId) throw new Error("User ID is required");
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if(user?.profilePicture){
            await minioService.deleteUserProfilePicture(userId, user.profilePicture);
        }
        const uploaded = await minioService.uploadUserProfilePicture(userId, file);

        return await prisma.user.update({
            where: { id: userId },
            data: { profilePicture: uploaded.url },
            include: {
                buyer: { include: { shippingAddress: true } },
                seller: { include: { address: true } }
            }
        });
    },

    async getAllUsers(skip: number, take: number) {
        return await prisma.user.findMany({
            skip,
            take,
            orderBy: { username: "asc" },
            include: { buyer: true, seller: true }
        });
    },

    async verifyUser(userId: number, status: 'VERIFIED' | 'REJECTED' | 'BANNED') {
        return await prisma.user.update({
            where: { id: userId },
            data: { status: status }
        });
    },

    async updateRole(targetUserId: number, newRole: 'ADMIN' | 'MODERATOR' | 'USER' | 'SUPER_ADMIN', requesterRole: string) {
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new Error("User not found!");
        }

        if (requesterRole === "SUPER_ADMIN") {
            return await prisma.user.update({ where: { id: targetUserId }, data: { role: newRole } });
        }

        if (requesterRole === "ADMIN") {
            if (targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN") {
                throw new Error("You do not have permission to modify this user's role!");
            }
            
            if (newRole === "ADMIN" || newRole === "SUPER_ADMIN") {
                throw new Error("You do not have permission to assign this role!");
            }
            return await prisma.user.update({ where: { id: targetUserId }, data: { role: newRole } });
        }

        throw new Error("You are not authorized to change roles!");
    }
};