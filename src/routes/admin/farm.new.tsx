import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Plus, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import type { CreateFarmInput } from '@/api/farms/schema'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateFarm } from '@/hooks'
import { createFarmSchema } from '@/api/farms/schema'
import { fileToBase64 } from '@/lib/file-utils'

export const Route = createFileRoute('/admin/farm/new')({
  component: AddNewInvestment,
})

interface ImagePreview {
  id: number
  url: string
}

function AddNewInvestment() {
  const [images, setImages] = useState<Array<ImagePreview>>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()
  const createFarm = useCreateFarm()

  const form = useForm<CreateFarmInput>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      location: '',
      image: '',
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

    // Store the first file for upload
    if (!imageFile && files[0]) {
      setImageFile(files[0])
    }

    const newImgs = files.map((file, idx) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
    }))
    setImages([...images, ...newImgs])
  }

  function handleRemoveImage(id: number) {
    setImages((imgs) => imgs.filter((img) => img.id !== id))
    setImageFile(null)
  }

  async function handleSubmit(values: CreateFarmInput) {
    if (!imageFile) {
      toast.error('Please upload at least one farm image')
      return
    }

    try {
      setIsUploading(true)

      // Convert image to base64
      const base64Image = await fileToBase64(imageFile)

      // Create farm with base64 image
      await createFarm.mutateAsync({
        ...values,
        image: base64Image,
      })

      toast.success('Farm opportunity created successfully!')
      navigate({ to: '/admin/farms' })
    } catch (error) {
      console.error('Failed to create farm:', error)
      toast.error('Failed to create farm. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-5xl mx-auto py-12 animate-fade-in px-4 sm:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-foreground tracking-tight">
          Add New Investment Opportunity
        </h1>
        <form
          className="space-y-0 bg-white rounded-2xl border border-border shadow-sm"
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
                    placeholder="Green Palm Trees Farm"
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
                    placeholder="Monrovia, Liberia"
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
            </div>

            {/* Section: Financial Details */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
                Financial & Farm Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                    placeholder="50,000"
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
                    placeholder="15"
                    className="bg-accent"
                    required
                    key={form.key('roi')}
                    {...form.getInputProps('roi')}
                  />
                  {form.errors.roi && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.errors.roi}
                    </p>
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
                    placeholder="6"
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
                    Min Investment
                  </Label>
                  <Input
                    id="minimumInvestment"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="100"
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
                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 hover:bg-red-100 border border-border"
                    >
                      <XCircle size={18} className="text-red-500" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-28 h-20 border-2 border-dashed border-border flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-accent relative transition">
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
              <p className="text-xs text-muted-foreground mt-2">
                Max 5 images.
              </p>
            </div>

            {/* Submission Button */}
            <div className="flex justify-end pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={isUploading || createFarm.isPending}
                className="h-12 px-10 text-base font-semibold bg-primary text-white border border-primary rounded-lg hover:bg-primary/90 active:bg-primary/80 focus:outline-none shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading || createFarm.isPending
                  ? 'Creating...'
                  : 'Create Opportunity'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
