import { z } from "zod"

export const UploadMoneySchema = z.object({
    amount: z.number().positive("The given amount must be positive!"),
});

export type UploadMoneyDTO = z.infer<typeof UploadMoneySchema>