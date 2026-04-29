import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileImage,
  Upload,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'

import type { KycDocumentType } from '@/types'
import type { KycSubmitFormValues, KycSubmitInput } from '@/api/kyc/schema'
import { kycSubmitSchema } from '@/api/kyc/schema'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useMyKyc, useResubmitKyc, useSubmitKyc } from '@/hooks'

export const Route = createFileRoute(
  '/$tenant/_authenticated/settings/verification',
)({
  component: VerificationPage,
})

const DOCUMENT_TYPES: Array<{
  value: KycDocumentType
  label: string
  description: string
}> = [
  {
    value: 'passport',
    label: 'International Passport',
    description: 'Photo page of your valid passport',
  },
  {
    value: 'national_id',
    label: 'National ID Card',
    description: 'Front of your government-issued ID',
  },
  {
    value: 'drivers_license',
    label: "Driver's License",
    description: 'Front of your valid driving license',
  },
]

function VerificationPage() {
  const { data, isLoading } = useMyKyc()
  const submitKyc = useSubmitKyc()
  const resubmitKyc = useResubmitKyc()

  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<
    KycSubmitFormValues,
    (values: KycSubmitFormValues) => KycSubmitInput
  >({
    initialValues: {
      documentType: 'passport',
      documentImage: null,
      selfieImage: null,
    },
    validate: zodResolver(kycSubmitSchema),
    transformValues: (values) => kycSubmitSchema.parse(values),
  })

  const kyc = data?.kyc

  function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDocumentPreview(URL.createObjectURL(file))
    form.setFieldValue('documentImage', file)
  }

  function handleSelfieUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelfiePreview(URL.createObjectURL(file))
    form.setFieldValue('selfieImage', file)
  }

  async function handleSubmit(values: KycSubmitInput) {
    try {
      setIsSubmitting(true)

      if (kyc?.status === 'rejected') {
        await resubmitKyc.mutateAsync(values)
        toast.success('Documents resubmitted for review')
      } else {
        await submitKyc.mutateAsync(values)
        toast.success('Documents submitted for verification')
      }

      // Reset form
      form.reset()
      setDocumentPreview(null)
      setSelfiePreview(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit documents')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Approved state
  if (kyc?.status === 'approved') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">Identity Verification</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your identity has been verified
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 border border-green-200 bg-green-50/50 rounded-xl">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-green-700">Verified</h3>
          <p className="text-muted-foreground text-sm mt-1 text-center max-w-sm">
            Your identity verification is complete. You have full access to all
            investment features.
          </p>
          <Badge
            variant="outline"
            className="mt-4 bg-green-100 text-green-700 border-green-300"
          >
            {kyc.documentType === 'passport'
              ? 'Passport'
              : kyc.documentType === 'national_id'
                ? 'National ID'
                : "Driver's License"}
          </Badge>
        </div>
      </div>
    )
  }

  // Pending state
  if (kyc?.status === 'pending') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">Identity Verification</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your verification is under review
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 border border-yellow-200 bg-yellow-50/50 rounded-xl">
          <Clock className="h-16 w-16 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-yellow-700">
            Under Review
          </h3>
          <p className="text-muted-foreground text-sm mt-1 text-center max-w-sm">
            Your documents are being reviewed. This usually takes 1-2 business
            days. We&apos;ll notify you by email once the review is complete.
          </p>
          <Badge
            variant="outline"
            className="mt-4 bg-yellow-100 text-yellow-700 border-yellow-300"
          >
            Submitted{' '}
            {kyc.createdAt ? new Date(kyc.createdAt).toLocaleDateString() : ''}
          </Badge>
        </div>
      </div>
    )
  }

  // Rejected state banner (show above form for resubmission)
  const isResubmission = kyc?.status === 'rejected'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Identity Verification</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {isResubmission
            ? 'Your previous submission was rejected. Please resubmit with corrections.'
            : 'Verify your identity to unlock full investment access'}
        </p>
      </div>

      {isResubmission && kyc.rejectionReason && (
        <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50/50 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-700 text-sm">
              Previous submission rejected
            </p>
            <p className="text-red-600 text-sm mt-1">{kyc.rejectionReason}</p>
          </div>
        </div>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
        {/* Document Type Selection */}
        <div>
          <Label className="mb-3 block font-medium">Document Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DOCUMENT_TYPES.map((doc) => (
              <button
                key={doc.value}
                type="button"
                onClick={() => form.setFieldValue('documentType', doc.value)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  form.values.documentType === doc.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <p className="font-medium text-sm">{doc.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {doc.description}
                </p>
              </button>
            ))}
          </div>
          {form.errors.documentType && (
            <p className="text-sm text-red-600 mt-1">
              {form.errors.documentType}
            </p>
          )}
        </div>

        {/* Document Upload */}
        <div>
          <Label className="mb-3 block font-medium">
            Upload Document <span className="text-red-500">*</span>
          </Label>
          {documentPreview ? (
            <div className="relative group border border-border rounded-xl overflow-hidden">
              <img
                src={documentPreview}
                alt="Document preview"
                className="w-full h-48 object-contain bg-accent"
              />
              <button
                type="button"
                onClick={() => {
                  setDocumentPreview(null)
                  form.setFieldValue('documentImage', null)
                }}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full border border-border hover:bg-red-50 transition-colors"
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-accent/50 transition-colors">
              <FileImage className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <span className="text-sm font-medium text-muted-foreground">
                Click to upload document
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                JPG, PNG up to 5MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </label>
          )}
          {form.errors.documentImage && (
            <p className="text-sm text-red-600 mt-1">
              {form.errors.documentImage}
            </p>
          )}
        </div>

        {/* Selfie Upload */}
        <div>
          <Label className="mb-3 block font-medium">
            Selfie with Document{' '}
            <span className="text-muted-foreground text-xs font-normal">
              (optional, recommended)
            </span>
          </Label>
          {selfiePreview ? (
            <div className="relative group border border-border rounded-xl overflow-hidden">
              <img
                src={selfiePreview}
                alt="Selfie preview"
                className="w-full h-48 object-contain bg-accent"
              />
              <button
                type="button"
                onClick={() => {
                  setSelfiePreview(null)
                  form.setFieldValue('selfieImage', null)
                }}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full border border-border hover:bg-red-50 transition-colors"
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-accent/50 transition-colors">
              <Upload className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <span className="text-sm font-medium text-muted-foreground">
                Take or upload a selfie holding your document
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                JPG, PNG up to 5MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleSelfieUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !form.values.documentImage}
            className="h-11 px-8"
          >
            {isSubmitting
              ? 'Submitting...'
              : isResubmission
                ? 'Resubmit Documents'
                : 'Submit for Verification'}
          </Button>
        </div>
      </form>
    </div>
  )
}
