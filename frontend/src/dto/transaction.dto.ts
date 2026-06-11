import { z } from "zod"

export const UploadMoneySchema = z.object({
    amount: z.number().positive("The given amount must be positive!"),
});

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.number(),
  amount: z.number(),
  type: z.string(),
  status: z.string(),
  stripeSessionId: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const AllTransactionSchema = z.object({
  id: z.string(),
  userId: z.number(),
  amount: z.number(),
  type: z.string(),
  status: z.string(),
  stripeSessionId: z.string().nullable(),
  createdAt: z.coerce.date(),
  user: z.object({
    username: z.string(),
    email: z.string(),
  })
});

export type TransactionDTO = z.infer<typeof TransactionSchema>;
export type AllTransactionDTO = z.infer<typeof AllTransactionSchema>;
export type UploadMoneyDTO = z.infer<typeof UploadMoneySchema>