import { z } from "zod"

export const GetTransactionsNumberSchema = z.object({
  take: z.coerce
    .number({ error: "Take must be a number!" })
    .min(1, "Take must be at least 1!")
    .optional()
    .default(20),
  skip: z.coerce
    .number({ error: "Skip must be a number!" })
    .min(0, "Skip must be at least 1!")
    .optional()
    .default(0),
})

export const UploadMoneySchema = z.object({
    amount: z.number().positive("The given amount must be positive!"),
});

export const TransactionResponseSchema = z.object({
  id: z.string(),
  userId: z.number(),
  amount: z.number(),
  type: z.string(),
  status: z.string(),
  stripeSessionId: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type TransactionResponseDTO = z.infer<typeof TransactionResponseSchema>;
export type UploadMoneyDTO = z.infer<typeof UploadMoneySchema>
export type GetTransactionsNumberDTO = z.infer<typeof GetTransactionsNumberSchema>; 