import { z } from 'zod'

export const currencyCodeSchema = z.enum(['NGN', 'USD', 'GHS', 'KES'])

const optionalCoordinate = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : Number(value)))
    .pipe(z.number().min(min).max(max).optional())

const requiredNumber = (requiredMessage: string, schema: z.ZodNumber) =>
  z.string().trim().min(1, requiredMessage).transform(Number).pipe(schema)

export const createFarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  location: z.string().min(1, 'Location is required'),
  currency: currencyCodeSchema,
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
  images: z.array(z.string()).min(1, 'At least one farm image is required'),
  investmentGoal: requiredNumber(
    'Investment goal is required',
    z.number().min(1, 'Investment goal must be at least 1'),
  ),
  minimumInvestment: requiredNumber(
    'Minimum investment is required',
    z.number().min(1, 'Minimum investment must be at least 1'),
  ),
  roi: requiredNumber(
    'ROI is required',
    z
      .number()
      .min(0, 'ROI cannot be negative')
      .max(100, 'ROI cannot exceed 100%'),
  ),
  durationMonths: requiredNumber(
    'Duration is required',
    z.number().int().min(1, 'Duration must be at least 1 month'),
  ),
})

export type CreateFarmFormValues = z.input<typeof createFarmSchema>
export type CreateFarmInput = z.output<typeof createFarmSchema>
