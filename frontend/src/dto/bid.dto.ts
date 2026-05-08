import { z } from "zod";

export const PlaceBidSchema = z.object({
  auctionId: z.number(),
  bidAmount: z.number().positive("Bid must be greater than zero"),
});

export const AutoBidSchema = z.object({
  auctionId: z.number(),
  maxAmount: z.number().positive("Max amount must be positive"),
  increment: z.number().positive("Increment must be positive").optional(),
});

export type AutoBidDTO = z.infer<typeof AutoBidSchema>;
export type PlaceBidDTO = z.infer<typeof PlaceBidSchema>;