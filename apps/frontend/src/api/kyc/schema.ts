import { z } from 'zod'

export const kycSubmitSchema = z.object({
  documentType: z.enum(['passport', 'national_id', 'drivers_license']),
  documentImage: z.string().min(1, 'Document image is required'),
  selfieImage: z.string().optional(),
})

export type KycSubmitInput = z.infer<typeof kycSubmitSchema>
