import { z } from "zod";

export const AuctionTypes = ["ENGLISH", "DUTCH", "VICKREY", "FPSB", "JAPANESE"] as const;
export const WatchCategories = ["WRISTWATCH" , "POCKETWATCH" , "SMARTWATCH" , "CLOCK"] as const;
export const AuctionStatus = [
  "PENDING",
  "UPCOMING",
  "ACTIVE",
  "ENDED",
  "CANCELLED"
] as const;

export const AuctionSchema = z.object({
  title: z.string().min(5, "Title too short").max(200),
  description: z.string().min(20, "Description should be more detailed"),
  auctionType: z.enum(AuctionTypes),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  startingPrice: z.number().min(0).default(0),
  reservePrice: z.number().optional(),
  buyingPrice: z.number().optional(),
  
  tickInterval: z.number().optional(),
  moneyInterval: z.number().optional(),
  minBidIncrement: z.number().default(1),
  isAscending: z.boolean().optional(),

  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    profilePicture: z.string().nullable(),
  }),

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

    category: z.enum(WatchCategories),

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

export const AuctionCardSchema = z.object({
  id: z.number(),
  title: z.string(),
  brand: z.string().optional(),
  currentPrice: z.number().optional(), 
  endTime: z.coerce.date(),
  images: z.array(z.string()).optional()
});

export const AuctionItemSchema = AuctionCardSchema.extend({
  description: z.string(),
});

export const AuctionFullSchema = AuctionSchema.extend({
  id: z.number(),
  userId: z.number(),
  currentPrice: z.number(),
  status: z.enum(AuctionStatus),

  bids: z.array(
    z.object({
      userId: z.number(),
    })
  ).optional(),
});

export type AuctionCardData = z.infer<typeof AuctionCardSchema>;
export type AuctionItemData = z.infer<typeof AuctionItemSchema>;
export type AuctionInformation = z.infer<typeof AuctionSchema>; 
export type AuctionFullData = z.infer<typeof AuctionFullSchema>;

export type AuctionInput = z.input<typeof AuctionSchema>;
export type AuctionOutput = z.infer<typeof AuctionSchema>;