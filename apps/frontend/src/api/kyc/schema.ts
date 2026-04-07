import { z } from 'zod'

const requiredFile = z
  .custom<File | null>((value) => value instanceof File, {
    message: 'Document image is required',
  })
  .transform((value) => value as File)

const optionalFile = z
  .custom<File | null>((value) => value == null || value instanceof File, {
    message: 'Invalid image file',
  })
  .transform((value) => value ?? undefined)

export const kycSubmitSchema = z.object({
  documentType: z.enum(['passport', 'national_id', 'drivers_license']),
  documentImage: requiredFile,
  selfieImage: optionalFile,
})

export type KycSubmitInput = z.output<typeof kycSubmitSchema>
export type KycSubmitFormValues = z.input<typeof kycSubmitSchema>
