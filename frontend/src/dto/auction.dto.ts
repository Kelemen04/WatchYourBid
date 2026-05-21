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

const optionalNumber = z.union([
  z.number(),
  z.nan().transform(() => undefined),
]).optional();

export const AuctionSchema = z.object({
  title: z.string().min(5, "Title too short").max(200),
  description: z.string().min(20, "Description should be more detailed"),
  auctionType: z.enum(AuctionTypes),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  startingPrice: z.union([
    z.number().min(0),
    z.nan().transform(() => 0),
  ]).default(0),
  reservePrice: optionalNumber,
  buyingPrice: optionalNumber,
  tickInterval: optionalNumber,
  moneyInterval: optionalNumber,
  minBidIncrement: z.union([
    z.number().min(1),
    z.nan().transform(() => 1),
  ]).default(1),
  isAscending: z.boolean().optional(),
  watchItem: z.object({
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    productionYear: optionalNumber,
    material: z.string(),
    condition: z.string(),
    weight: optionalNumber,
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

export const AuctionTableSchema = AuctionItemSchema.extend({
  status: z.string(),
  user: z.object({
    username: z.string()
  }).optional()
});

export const AuctionInformationSchema = AuctionSchema.extend({
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    profilePicture: z.string().nullable(),
  }),
});

export type AuctionCardData = z.infer<typeof AuctionCardSchema>;
export type AuctionItemData = z.infer<typeof AuctionItemSchema>;
export type AuctionInformation = z.infer<typeof AuctionInformationSchema>; 
export type AuctionFullData = z.infer<typeof AuctionFullSchema>;

export type AuctionInput = z.input<typeof AuctionSchema>;
export type AuctionOutput = z.infer<typeof AuctionSchema>;
export type AuctionTableData = z.infer<typeof AuctionTableSchema>;