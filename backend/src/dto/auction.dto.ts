import { z } from "zod";
import { AuctionType, WatchCategory } from "../../generated/prisma";

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
  existingImages: z.array(z.string()).optional(),

  watchItem: z.object({
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    productionYear: z.number().optional(),
    material: z.string(),
    condition: z.string(),
    weight: z.number().optional(),
    hasBox: z.boolean().default(false),
    hasPapers: z.boolean().default(false),
    isOriginal: z.boolean().default(true),

    category: z.nativeEnum(WatchCategory),

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
  }).optional()
});

export const AuctionFilterSchema = z.object({
  searchTerm: z.string({ error: "Search term must be a text!" }).optional(),
  
  category: z.nativeEnum(WatchCategory, {
    error: () => ({ message: "The selected category does not exist!" })
  }).optional(),
  minPrice: z.coerce
    .number({ error: "Minimum price must be a number!" })
    .min(0, "Price cannot be negative!")
    .optional(),
  maxPrice: z.coerce
    .number({ error: "Maximum price must be a number!" })
    .min(0, "Price cannot be negative!")
    .optional(),
  auctionType: z.nativeEnum(AuctionType, {
    error: () => ({ message: "Invalid auction type!" })
  }).optional(),
  brand: z.string({ error: "Brand must be a text!" }).optional(),
  condition: z.string({ error: "Condition must be a text!" }).optional(),
  material: z.string({ error: "Material must be a text!" }).optional(),
  minYear: z.coerce
    .number({ error: "Year must be a number!" })
    .min(0, "Year cannot be negative!")
    .optional(),
  maxYear: z.coerce
    .number({ error: "Year must be a number!" })
    .min(0, "Year cannot be negative!")
    .optional(),
  sortBy: z.string({ error: "Sort by must be a text!" })
    .optional()
    .default("newest"),
  skip: z.coerce
    .number({ error: "Skip must be a number!" })
    .min(0, "Skip cannot be negative!")
    .optional()
    .default(0),
  take: z.coerce
    .number({ error: "Take must be a number!" })
    .min(1, "Take must be at least 1!")
    .optional()
    .default(20),
});

export const UpdateAuctionSchema = CreateAuctionSchema.partial();

export type CreateAuctionDTO = z.infer<typeof CreateAuctionSchema>;
export type UpdateAuctionDTO = z.infer<typeof UpdateAuctionSchema>;
export type AuctionFilterDTO = z.infer<typeof AuctionFilterSchema>;
