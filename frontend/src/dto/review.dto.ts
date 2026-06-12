import { z } from "zod"

export const ReviewSchema = z.object({
    rating: z.number().gte(1).lte(5),
    comment: z.string().min(1).max(200),
});

export const UserReviewSchema = z.object({
  id: z.number(),
  rating: z.number(),
  comment: z.string().nullable(),
  createdAt: z.union([z.string(), z.date()]),
  reviewer: z.object({
    id: z.number(),
    username: z.string(),
  }),

  auction: z.object({
    title: z.string(),
  }).optional(),
});

export type ReviewDTO = z.infer<typeof ReviewSchema>
export type UserReviewDTO = z.infer<typeof UserReviewSchema>