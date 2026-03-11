import { z } from "zod";

export const RegisterSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  email: z.string()
});

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;