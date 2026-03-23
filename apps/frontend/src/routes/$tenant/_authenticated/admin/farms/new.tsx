import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { ArrowLeft, Plus, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import type { CreateFarmInput } from '@/api/farms/schema'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateFarm } from '@/hooks'
import { createFarmSchema } from '@/api/farms/schema'
import { fileToBase64 } from '@/lib/file-utils'
import { currencyOptions } from '@/lib/format-currency'

export const Route = createFileRoute('/$tenant/_authenticated/admin/farms/new')(
  {
    component: AddNewInvestment,
  },
)

interface ImagePreview {
  id: number
  url: string
  file: File
}

function AddNewInvestment() {
  const { tenant } = Route.useParams()
  const [images, setImages] = useState<Array<ImagePreview>>([])
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()
  const createFarm = useCreateFarm()

  const form = useForm<CreateFarmInput>({
    initialValues: {
      name: '',
      location: '',
      latitude: undefined,
      longitude: undefined,
      currency: 'NGN',
      images: [],
      investmentGoal: 0,
      minimumInvestment: 0,
      roi: 0,
      durationMonths: 0,
    },
    validate: zodResolver(createFarmSchema),
  })

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)

    const remaining = 5 - images.length
    const filesToAdd = files.slice(0, remaining)

    const newImgs = filesToAdd.map((file, idx) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
      file,
    }))
    setImages((prev) => [...prev, ...newImgs])
  }

  function handleRemoveImage(id: number) {
    setImages((imgs) => imgs.filter((img) => img.id !== id))
  }

  async function handleSubmit(values: CreateFarmInput) {
    if (images.length === 0) {
      toast.error('Please upload at least one farm image')
      return
    }

    try {
      setIsUploading(true)

      // Convert all images to base64
      const base64Images = await Promise.all(
        images.map((img) => fileToBase64(img.file)),
      )

      const { latitude, longitude, ...rest } = values

      // Create farm with all images and optional coordinates
      await createFarm.mutateAsync({
        ...rest,
        images: base64Images,
        ...(latitude != null && longitude != null
          ? {
              coordinates: {
                latitude: Number(latitude),
                longitude: Number(longitude),
              },
            }
          : {}),
      })

      toast.success('Farm opportunity created successfully!')
      navigate({ to: '/$tenant/admin/farms', params: { tenant } })
    } catch (error) {
      console.error('Failed to create farm:', error)
      toast.error('Failed to create farm. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-12 animate-fade-in px-4 sm:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Farms', to: '/$tenant/admin/farms', params: { tenant } },
          { label: 'New Opportunity' },
        ]}
        className="mb-6"
      />

      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-10">
        <Link
          to="/$tenant/admin/farms"
          params={{ tenant }}
          className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Add New Investment Opportunity
        </h1>
      </div>
      <form
        className="space-y-0 rounded-2xl border border-border bg-card shadow-sm"
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <div className="p-8 pb-4 md:pb-4">
          {/* Section: Basic Information */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="name"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Opportunity Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter farm name"
                  className="bg-accent"
                  required
                  key={form.key('name')}
                  {...form.getInputProps('name')}
                />
                {form.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.name}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="location"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Enter farm location"
                  className="bg-accent"
                  required
                  key={form.key('location')}
                  {...form.getInputProps('location')}
                />
                {form.errors.location && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label
                  htmlFor="latitude"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Latitude{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="e.g. 6.4281"
                  className="bg-accent"
                  key={form.key('latitude')}
                  {...form.getInputProps('latitude')}
                />
                {form.errors.latitude && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.latitude}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="longitude"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Longitude{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="e.g. -10.7957"
                  className="bg-accent"
                  key={form.key('longitude')}
                  {...form.getInputProps('longitude')}
                />
                {form.errors.longitude && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.longitude}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Financial Details */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
              Financial & Farm Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              <div>
                <Label
                  htmlFor="currency"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Currency
                </Label>
                <Select
                  value={form.values.currency}
                  onValueChange={(value) =>
                    form.setFieldValue(
                      'currency',
                      value as CreateFarmInput['currency'],
                    )
                  }
                >
                  <SelectTrigger id="currency" className="w-full bg-accent">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.currency && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.currency}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="investmentGoal"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Target Amount
                </Label>
                <Input
                  id="investmentGoal"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Enter target amount"
                  className="bg-accent"
                  required
                  key={form.key('investmentGoal')}
                  {...form.getInputProps('investmentGoal')}
                />
                {form.errors.investmentGoal && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.investmentGoal}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="roi"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Projected ROI{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (%)
                  </span>
                </Label>
                <Input
                  id="roi"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  placeholder="Enter projected ROI"
                  className="bg-accent"
                  required
                  key={form.key('roi')}
                  {...form.getInputProps('roi')}
                />
                {form.errors.roi && (
                  <p className="text-sm text-red-600 mt-1">{form.errors.roi}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="durationMonths"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Duration{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (months)
                  </span>
                </Label>
                <Input
                  id="durationMonths"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Enter duration in months"
                  className="bg-accent"
                  required
                  key={form.key('durationMonths')}
                  {...form.getInputProps('durationMonths')}
                />
                {form.errors.durationMonths && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.durationMonths}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="minimumInvestment"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Minimum Investment
                </Label>
                <Input
                  id="minimumInvestment"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Enter minimum investment amount"
                  className="bg-accent"
                  required
                  key={form.key('minimumInvestment')}
                  {...form.getInputProps('minimumInvestment')}
                />
                {form.errors.minimumInvestment && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.errors.minimumInvestment}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Images */}
          <div className="mb-16">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Farm Images
            </h2>
            <Label className="block mb-3 font-medium tracking-tight text-muted-foreground text-[15px]">
              Upload up to 5 farm images (JPG or PNG only)
            </Label>
            <div className="flex items-center gap-4 flex-wrap mb-1">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative group w-28 h-20 border border-border bg-accent rounded-lg overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={img.url}
                    alt={`Farm Preview ${img.id}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 rounded-full border border-border bg-card p-0.5 hover:bg-destructive/10"
                  >
                    <XCircle size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="relative flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition hover:bg-secondary">
                  <Plus className="text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">
                    Add Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Max 5 images.</p>
          </div>

          {/* Submission Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate({ to: '/$tenant/admin/farms', params: { tenant } })
              }
              disabled={isUploading || createFarm.isPending}
              className="h-12 px-8 text-base font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || createFarm.isPending}
              className="btn-primary-gradient h-12 px-10 text-base font-semibold rounded-lg focus:outline-none shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading || createFarm.isPending
                ? 'Creating...'
                : 'Create Opportunity'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
