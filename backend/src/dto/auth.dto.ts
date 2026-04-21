import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(3, "Minimum 3 characters").max(30).trim(),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .max(100, "Must contain atmost 100 characters!")
    .regex(/[a-z]/, "Must contain a lowercase letter!")
    .regex(/[A-Z]/, "Must contain an uppercase letter!")
    .regex(/[0-9]/, "Must contain a number!")
    .regex(/[!@#$%^&*.?_-]/, "Must contain special characters!"),
  email: z.string().email("Invalid email!").toLowerCase().trim(),
});

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is mandatory!"),
  password: z.string().min(1, "Password is mandatory!"),
});

export const ForgotPassword = z.object({
  email: z.string().email("Invalid email!").toLowerCase().trim(),
})

export const ResetPassword = z.object({
  token: z.string(),
  newPassword: z.string()
    .min(8, "Minimum 8 characters")
    .max(100, "Must contain atmost 100 characters!")
    .regex(/[a-z]/, "Must contain a lowercase letter!")
    .regex(/[A-Z]/, "Must contain an uppercase letter!")
    .regex(/[0-9]/, "Must contain a number!")
    .regex(/[!@#$%^&*.?_-]/, "Must contain special characters!"),
})

export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPassword>;
export type ResetPasswordDTO = z.infer<typeof ResetPassword>;