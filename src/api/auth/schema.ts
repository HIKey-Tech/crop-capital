import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    country: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['investor', 'admin']),
  country: z.string().optional(),
  photo: z.string().optional(),
  isVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const authResponseSchema = z.object({
  success: z.boolean(),
  token: z.string(),
  user: userSchema,
})

export const getMeResponseSchema = z.object({
  success: z.boolean(),
  user: userSchema,
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = Omit<
  z.infer<typeof registerSchema>,
  'confirmPassword'
>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type AuthUser = z.infer<typeof userSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type GetMeResponse = z.infer<typeof getMeResponseSchema>
