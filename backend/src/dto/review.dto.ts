import { z } from "zod"

export const ReviewSchema = z.object({
    rating: z.number().gte(1).lte(5),
    comment: z.string().min(1).max(200),
});

export type ReviewDTO = z.infer<typeof ReviewSchema>