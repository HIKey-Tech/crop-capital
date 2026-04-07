import { z } from 'zod'

export const PASSWORD_REQUIREMENTS_HINT =
  'Use at least 8 characters with uppercase, lowercase, number, and special character.'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character')

export const passwordConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    country: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export const resetPasswordSchema = passwordConfirmationSchema

export const activateAdminSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
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
