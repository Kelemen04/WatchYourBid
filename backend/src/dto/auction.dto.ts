import { z } from "zod";
import { AuctionType } from "../../generated/prisma";
import { createAuction } from "../controllers/auction.controller";

export const CreateAuctionSchema = z.object({
  title: z.string().min(5, "Title too short").max(200),
  description: z.string().min(20, "Description should be more detailed"),
  auctionType: z.nativeEnum(AuctionType),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  startingPrice: z.number().min(0),
  reservePrice: z.number().optional(),
  buyingPrice: z.number().optional(),
  
  tickInterval: z.number().optional(),
  moneyInterval: z.number().optional(),
  minBidIncrement: z.number().default(1),
  isAscending: z.boolean().optional(),

  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  productionYear: z.number().optional(),
  material: z.string(),
  condition: z.string(),
  weight: z.number().optional(),
  hasBox: z.boolean().default(false),
  hasPapers: z.boolean().default(false),
  isOriginal: z.boolean().default(true),

  category: z.enum(["WRISTWATCH", "POCKETWATCH", "SMARTWATCH", "CLOCK"]),

  wristwatch: z.object({
    movementType: z.string(),
    caseDiameter: z.number(),
    waterResistance: z.string(),
    strapMaterial: z.string(),
    glassType: z.string(),
  }).optional(),

  pocketWatch: z.object({
    caseType: z.string(),
    movementType: z.string(),
    hasChain: z.boolean(),
    complications: z.string().optional(),
  }).optional(),

  smartwatch: z.object({
    os: z.string(),
    batteryLife: z.number(),
    screenType: z.string(),
    sensors: z.string(),
    compatibility: z.string(),
  }).optional(),

  clock: z.object({
    clockType: z.string(),
    powerSource: z.string(),
    chimeType: z.string().optional(),
    dimensions: z.string(),
  }).optional(),
});

export const UpdateAuctionSchema = CreateAuctionSchema.partial();

export type CreateAuctionDTO = z.infer<typeof CreateAuctionSchema>;
export type UpdateAuctionDTO = z.infer<typeof UpdateAuctionSchema>;
