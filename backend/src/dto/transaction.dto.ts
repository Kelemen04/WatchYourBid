import { z } from "zod"

export const UploadMoneySchema = z.object({
    amount: z.number().positive("The given amount must be positive!"),
});

export const TransactionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  amount: z.number(),
  type: z.string(),
  status: z.string(),
  stripeSessionId: z.string().nullable(),
  createdAt: z.date(),
});

export type TransactionResponseDTO = z.infer<typeof TransactionResponseSchema>;
export type UploadMoneyDTO = z.infer<typeof UploadMoneySchema>