import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Plus, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { ChangeEvent } from 'react'

import type { CreateFarmInput } from '@/api/farms/schema'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFarm, useUpdateFarm } from '@/hooks'
import { createFarmSchema } from '@/api/farms/schema'
import { LoadingSpinner } from '@/components/ui/loading'

export const Route = createFileRoute('/admin/farms/$id/edit')({
  component: EditFarmPage,
})

interface ImagePreview {
  id: number
  url: string
}

function EditFarmPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { data, isLoading, error } = useFarm(id)
  const updateFarmMutation = useUpdateFarm()

  const [images, setImages] = useState<Array<ImagePreview>>([])
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null)

  const form = useForm<CreateFarmInput>({
    mode: 'uncontrolled',
    validate: zodResolver(createFarmSchema),
  })

  // Pre-fill form when data is loaded
  useEffect(() => {
    if (data?.farm) {
      form.setValues({
        name: data.farm.name,
        location: data.farm.location,
        image: data.farm.image,
        investmentGoal: data.farm.investmentGoal,
        minimumInvestment: data.farm.minimumInvestment,
        roi: data.farm.roi,
        durationMonths: data.farm.durationMonths,
      })
      if (data.farm.image) {
        setImages([{ id: 1, url: data.farm.image }])
      }
    }
  }, [data])

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <LoadingSpinner />
      </DashboardLayout>
    )
  }

  if (error || !data?.farm) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">Failed to load farm details.</p>
        </div>
      </DashboardLayout>
    )
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = () => {
        const base64String = reader.result as string
        const previewUrl = URL.createObjectURL(file)

        setImages([{ id: Date.now(), url: previewUrl }])
        setNewImageBase64(base64String)
      }

      reader.onerror = () => {
        toast.error('Failed to read image file')
      }

      reader.readAsDataURL(file)
    }
  }

  function handleRemoveImage() {
    setImages([])
    setNewImageBase64(null)
  }

  function handleSubmit(values: CreateFarmInput) {
    updateFarmMutation.mutate(
      {
        id,
        data: {
          name: values.name,
          location: values.location,
          image: newImageBase64 || data?.farm.image || values.image,
          investmentGoal: values.investmentGoal,
          minimumInvestment: values.minimumInvestment,
          roi: values.roi,
          durationMonths: values.durationMonths,
        },
      },
      {
        onSuccess: () => {
          toast.success('Farm updated successfully')
          navigate({ to: '/admin/farms' })
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to update farm')
        },
      },
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-5xl mx-auto py-12 animate-fade-in px-4 sm:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-foreground tracking-tight">
          Edit Opportunity: {data.farm.name}
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
                    className="bg-accent"
                    required
                    key={form.key('investmentGoal')}
                    {...form.getInputProps('investmentGoal')}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="roi"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Projected ROI (%)
                  </Label>
                  <Input
                    id="roi"
                    type="number"
                    className="bg-accent"
                    required
                    key={form.key('roi')}
                    {...form.getInputProps('roi')}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="durationMonths"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Duration (months)
                  </Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    className="bg-accent"
                    required
                    key={form.key('durationMonths')}
                    {...form.getInputProps('durationMonths')}
                  />
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
                    className="bg-accent"
                    required
                    key={form.key('minimumInvestment')}
                    {...form.getInputProps('minimumInvestment')}
                  />
                </div>
              </div>
            </div>

            {/* Section: Images */}
            <div className="mb-16">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Farm Images
              </h2>
              <div className="flex items-center gap-4 flex-wrap mb-1">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group w-28 h-20 border border-border bg-accent rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={img.url}
                      alt="Farm"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage()}
                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 hover:bg-red-100 border border-border"
                    >
                      <XCircle size={18} className="text-red-500" />
                    </button>
                  </div>
                ))}
                {images.length < 1 && (
                  <label className="w-28 h-20 border-2 border-dashed border-border flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-accent relative transition">
                    <Plus className="text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">
                      Change Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submission Button */}
            <div className="flex justify-end pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={updateFarmMutation.isPending}
                className="h-12 px-10 text-base font-semibold bg-primary text-white border border-primary rounded-lg hover:bg-primary/90"
              >
                {updateFarmMutation.isPending
                  ? 'Saving...'
                  : 'Update Opportunity'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
