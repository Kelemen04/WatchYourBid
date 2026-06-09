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
})

export const RegisterFormSchema = RegisterSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email!").toLowerCase().trim(),
});

export const PasswordResetFormSchema = z.object({
  newPassword: z.string()
    .min(8, "Minimum 8 characters")
    .max(100, "Must contain atmost 100 characters!")
    .regex(/[a-z]/, "Must contain a lowercase letter!")
    .regex(/[A-Z]/, "Must contain an uppercase letter!")
    .regex(/[0-9]/, "Must contain a number!")
    .regex(/[!@#$%^&*.?_-]/, "Must contain special characters!"),
  confirmNewPassword: z.string(),
});

export const PasswordResetSchema = z.object({
  newPassword: z.string(),
  token: z.string(),
});

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is mandatory!"),
  password: z.string().min(1, "Password is mandatory!"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type RegisterFormDTO = z.infer<typeof RegisterFormSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type PasswordResetDTO = z.infer<typeof PasswordResetSchema>;
export type PasswordResetFormDTO = z.infer<typeof PasswordResetFormSchema>;