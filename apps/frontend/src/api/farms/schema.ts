import { z } from 'zod'

export const createFarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  location: z.string().min(1, 'Location is required'),
  latitude: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().min(-90).max(90))
    .optional(),
  longitude: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().min(-180).max(180))
    .optional(),
  images: z.array(z.string()).min(1, 'At least one farm image is required'),
  investmentGoal: z.number().min(1, 'Investment goal must be at least 1'),
  minimumInvestment: z.number().min(1, 'Minimum investment must be at least 1'),
  roi: z
    .number()
    .min(0, 'ROI cannot be negative')
    .max(100, 'ROI cannot exceed 100%'),
  durationMonths: z.number().int().min(1, 'Duration must be at least 1 month'),
})

export type CreateFarmInput = z.infer<typeof createFarmSchema>
