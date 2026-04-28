import { z } from 'zod'

import { currencyCodeSchema } from '@/api/farms/schema'

const requiredNumber = (requiredMessage: string, minimum: number) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .transform(Number)
    .pipe(z.number().min(minimum, `Value must be at least ${minimum}`))

export const createCommoditySchema = z.object({
  name: z.string().min(1, 'Commodity name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().trim().optional(),
  location: z.string().min(1, 'Location is required'),
  currency: currencyCodeSchema,
  unit: z.string().min(1, 'Unit is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  price: requiredNumber('Price is required', 0),
  availableQuantity: requiredNumber('Available quantity is required', 0),
  minimumOrderQuantity: requiredNumber('Minimum order quantity is required', 1),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
})

export type CreateCommodityFormValues = z.input<typeof createCommoditySchema>
export type CreateCommodityInput = z.output<typeof createCommoditySchema>
