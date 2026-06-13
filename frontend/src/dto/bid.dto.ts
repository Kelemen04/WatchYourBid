import { z } from "zod";

export const PlaceBidSchema = z.object({
  bidAmount: z.number().positive("Bid must be greater than zero"),
});

export const AutoBidSchema = z.object({
  maxAmount: z.number().positive("Max amount must be positive"),
  increment: z.number().positive("Increment must be positive").optional(),
});

export const PlacePromotingBidSchema = z.object({
  maxAmount: z.number().positive("Promotion budget must be positive"),
});

export const BidDataSchema = z.object({
  id: z.number(),
  bidAmount: z.number(),
  bidTime: z.union([z.string(), z.date()]).optional(),
  isWinner: z.boolean(),
  user: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
  })
})

export const MyBidsResponseSchema = z.object({
  id: z.number(),
  bidAmount: z.number(),
  bidTime: z.coerce.date(),
  isWinner: z.boolean(),
  auctionId: z.number(),
  auction: z.object({
    id: z.number(),
    title: z.string(),
    currentPrice: z.number(),
    status: z.string(),
    endTime: z.coerce.date(),
  }),
});

export type MyBidsDTO = z.infer<typeof MyBidsResponseSchema>;
export type AutoBidDTO = z.infer<typeof AutoBidSchema>;
export type PlaceBidDTO = z.infer<typeof PlaceBidSchema>;
export type PlacePromotingBidDTO = z.infer<typeof PlacePromotingBidSchema>;
export type BidDataDTO = z.infer<typeof BidDataSchema>;