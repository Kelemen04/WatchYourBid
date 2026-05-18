import { z } from "zod";

export const PlaceBidSchema = z.object({
  bidAmount: z.number().positive("Bid must be greater than zero"),
});

export const AutoBidSchema = z.object({
  maxAmount: z.number().positive("Max amount must be positive"),
  increment: z.number().positive("Increment must be positive").optional(),
});

export const PlacePromotingBidSchema = z.object({
  auctionId: z.number(),
  maxAmount: z.number().positive("Promotion budget must be positive"),
});

export type AutoBidDTO = z.infer<typeof AutoBidSchema>;
export type PlaceBidDTO = z.infer<typeof PlaceBidSchema>;
export type PlacePromotingBidDTO = z.infer<typeof PlacePromotingBidSchema>;