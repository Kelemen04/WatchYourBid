import { z } from "zod";

export const GetBidsNumberSchema = z.object({
  take: z.coerce
    .number({ error: "Take must be a number!" })
    .min(1, "Take must be at least 1!")
    .optional()
    .default(20),
})

export const PlaceBidSchema = z.object({
  bidAmount: z.number().positive("Bid must be greater than zero"),
});

export const PlacePromotingBidSchema = z.object({
  maxAmount: z.number().positive("Bid must be greater than zero"),
});

export const AutoBidSchema = z.object({
  maxAmount: z.number().positive("Max amount must be positive"),
  increment: z.number().positive("Increment must be positive").optional(),
});

export const BidDataSchema = z.object({
  id: z.number(),
  bidAmount: z.number(),
  bidTime: z.union([z.string(), z.date()]).optional(),
  user: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
  })
})

export const MyBidsResponseSchema = z.object({
  id: z.number(),
  bidAmount: z.number(),
  bidTime: z.date(),
  isWinner: z.boolean(),
  auctionId: z.number(),
  auction: z.object({
    id: z.number(),
    title: z.string(),
    currentPrice: z.number(),
    status: z.string(),
    endTime: z.date(),
  }),
});

export type MyBidsResponseDTO = z.infer<typeof MyBidsResponseSchema>;
export type AutoBidDTO = z.infer<typeof AutoBidSchema>;
export type PlaceBidDTO = z.infer<typeof PlaceBidSchema>;
export type PlacePromotingBidDTO = z.infer<typeof PlacePromotingBidSchema>;
export type BidDataOut = z.infer<typeof BidDataSchema>;
export type GetBidsNumberDTO = z.infer<typeof GetBidsNumberSchema>;