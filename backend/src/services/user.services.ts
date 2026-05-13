import { prisma } from "../db/client"
import type { BuyerRegisterDTO, SellerRegisterDTO, MeResponse, UpdateBuyer, UpdateSeller, UpdateUser } from "../dto/user.dto";
import { minioService } from "./minio.service";

export const userService = {
    async getMe(userId: number){
      if(!userId){
        throw new Error("No user id was given")
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profilePicture: true,
          buyer: { include: { shippingAddress: true } },
          seller: { include: { address: true } }
        }
      });

      if(!user){
        throw new Error("No user found!")
      }

      return user as MeResponse;
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
    async registerBuyer(data: BuyerRegisterDTO, userId: number){
    try{
      if(!userId){
        throw new Error("No user id was given")
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { buyer: true }
      });

      if (user?.buyer) throw new Error("You are already registered as a buyer!");

      const existing = await prisma.user.findFirst({
        where: { 
          phoneNumber: data.phoneNumber,
          NOT: {
            id: userId,
          }
         },
      });

      if (existing) {
        throw new Error("Phone number already exists!");
      }

      return await prisma.user.update({
        where: { 
          id: userId
        },
        data: { 
          firstName: data.firstName,
          lastName: data.lastName,
          profilePicture: data.profilePicture,
          phoneNumber: data.phoneNumber,
          buyer: {
            create: {
              shippingAddress: {
                create: {
                  country: data.country,
                  region: data.region,
                  city: data.city,
                  street: data.street,
                  number: data.number,
                  building: data.building ?? null,
                  floor: data.floor ?? null,
                  apartment: data.apartment ?? null,
                  zipCode: data.zipCode,
                }
              }
            }
          }
        },
      });
    } catch(e: any) {
      throw new Error(e.message || "Buyer registration failed");
    }
  },

  async registerSeller(data: SellerRegisterDTO, userId: number){
    try{
      if(!userId){
        throw new Error("No user id was given")
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { seller: true }
      });

      if (user?.seller) throw new Error("You are already registered as a seller!");

      const existing = await prisma.user.findFirst({
        where: { 
          phoneNumber: data.phoneNumber,
          NOT: {
            id: userId,
          }
         },
      });

      if (existing) {
        throw new Error("Phone number already exists!");
      }

      return await prisma.user.update({
        where: { 
          id: userId
        },
        data: { 
          firstName: data.firstName,
          lastName: data.lastName,
          profilePicture: data.profilePicture,
          phoneNumber: data.phoneNumber,
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
                  building: data.building ?? null,
                  floor: data.floor ?? null,
                  apartment: data.apartment ?? null,
                  zipCode: data.zipCode,
                }
              }
            }
          }
        },
      });
    } catch(e: any) {
      throw new Error(e.message || "Seller registration failed");
    }
  },
  async uploadUserFiles(userId: number, file: Express.Multer.File){
    const uploaded = await minioService.uploadUserProfilePicture(userId,file);
    const image = uploaded.url;
  
    return await prisma.user.update({
      where: { id: userId},
      data: { image: image},
      include: {
        buyer: true,
        seller: true,
      }
    })
  }
};

