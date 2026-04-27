import { z } from "zod";

export const AuctionCardSchema = z.object({
  id: z.number(),
  title: z.string(),
  brand: z.string().optional(),
  currentPrice: z.number().optional(), 
  endTime: z.coerce.date(),
});

export const AuctionItemSchema = AuctionCardSchema.extend({
  description: z.string(),
});

export type AuctionCardData = z.infer<typeof AuctionCardSchema>;
export type AuctionItemData = z.infer<typeof AuctionItemSchema>;