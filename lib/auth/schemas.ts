import { z } from "zod/v4"

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  role: z.enum(["STUDENT", "TEACHER"]),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  headline: z.string().max(160).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  website: z.string().url("Must be a valid URL").max(200).optional().nullable().or(z.literal("")),
})

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
