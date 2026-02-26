import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import {
  CalendarDays,
  ImageIcon,
  Megaphone,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ChangeEvent } from 'react'

import type { CreateFarmInput } from '@/api/farms/schema'
import type { CreateFarmRequest } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddFarmUpdate, useFarm, useUpdateFarm } from '@/hooks'
import { createFarmSchema } from '@/api/farms/schema'
import { LoadingSpinner } from '@/components/ui/loading'
import { formatDate } from '@/lib/format-date'

import { fileToBase64 } from '@/lib/file-utils'

export const Route = createFileRoute('/_authenticated/admin/farms/$id/edit')({
  component: EditFarmPage,
})

interface ImagePreview {
  id: number
  url: string
  file?: File
  isExisting?: boolean
}

function EditFarmPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { data, isLoading, error } = useFarm(id)
  const updateFarmMutation = useUpdateFarm()

  const [images, setImages] = useState<Array<ImagePreview>>([])
  const [hasImageChanges, setHasImageChanges] = useState(false)

  const form = useForm<CreateFarmInput>({
    validate: zodResolver(createFarmSchema),
  })

  // Pre-fill form when data is loaded
  useEffect(() => {
    if (data?.farm) {
      form.setValues({
        name: data.farm.name,
        location: data.farm.location,
        latitude: data.farm.coordinates?.latitude,
        longitude: data.farm.coordinates?.longitude,
        images: data.farm.images,
        investmentGoal: data.farm.investmentGoal,
        minimumInvestment: data.farm.minimumInvestment,
        roi: data.farm.roi,
        durationMonths: data.farm.durationMonths,
      })

      setImages(
        data.farm.images.map((url, idx) => ({
          id: idx + 1,
          url,
          isExisting: true,
        })),
      )
    }
  }, [data])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data?.farm) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Failed to load farm details.</p>
      </div>
    )
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    const remaining = 5 - images.length
    const filesToAdd = files.slice(0, remaining)

    const newImgs = filesToAdd.map((file, idx) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }))

    setImages((prev) => [...prev, ...newImgs])
    setHasImageChanges(true)
  }

  function handleRemoveImage(imageId: number) {
    setImages((imgs) => imgs.filter((img) => img.id !== imageId))
    setHasImageChanges(true)
  }

  async function handleSubmit(values: CreateFarmInput) {
    try {
      const { latitude, longitude, ...rest } = values
      const updateData: Partial<CreateFarmRequest> = {
        name: rest.name,
        location: rest.location,
        investmentGoal: rest.investmentGoal,
        minimumInvestment: rest.minimumInvestment,
        roi: rest.roi,
        durationMonths: rest.durationMonths,
        ...(latitude != null && longitude != null
          ? {
              coordinates: {
                latitude: Number(latitude),
                longitude: Number(longitude),
              },
            }
          : {}),
      }

      // Only send images if they changed
      if (hasImageChanges) {
        const base64Images = await Promise.all(
          images.map(async (img) => {
            if (img.file) {
              return fileToBase64(img.file)
            }
            // Existing image URL — keep as-is
            return img.url
          }),
        )
        updateData.images = base64Images
      }

      updateFarmMutation.mutate(
        { id, data: updateData },
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
    } catch (err) {
      toast.error('Failed to process images')
    }
  }

  return (
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
                  placeholder="Enter opportunity name"
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
                  placeholder="Enter farm location"
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
                  placeholder="Enter target amount"
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
                  placeholder="Enter projected ROI"
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
                  placeholder="Enter duration in months"
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
                  Minimum Investment
                </Label>
                <Input
                  id="minimumInvestment"
                  type="number"
                  className="bg-accent"
                  placeholder="Enter minimum investment amount"
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
            <p className="text-xs text-muted-foreground mt-2">Max 5 images.</p>
          </div>

          {/* Section: Farm Updates */}
          <div className="mb-16">
            <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
              Farm Updates
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add progress updates that investors can see on the farm detail
              page and the News feed.
            </p>

            <FarmUpdateForm farmId={id} />

            {/* Existing updates */}
            {data.farm.updates.length > 0 ? (
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Published Updates ({data.farm.updates.length})
                </h3>
                {[...data.farm.updates]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((update, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 bg-accent/50 border border-border rounded-lg p-4"
                    >
                      {update.image && (
                        <img
                          src={update.image}
                          alt={update.stage}
                          className="w-16 h-16 rounded-md object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {update.stage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(update.date)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg mt-6">
                <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No updates published yet.</p>
              </div>
            )}
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
  )
}

function FarmUpdateForm({ farmId }: { farmId: string }) {
  const addUpdate = useAddFarmUpdate()
  const [stage, setStage] = useState('')
  const [updateImageBase64, setUpdateImageBase64] = useState<string | null>(
    null,
  )
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(
    null,
  )

  function handleUpdateImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setUpdateImageBase64(reader.result as string)
        setUpdateImagePreview(URL.createObjectURL(file))
      }
      reader.readAsDataURL(file)
    }
  }

  function handleAddUpdate() {
    if (!stage.trim()) {
      toast.error('Please enter an update title')
      return
    }

    addUpdate.mutate(
      {
        id: farmId,
        update: {
          stage: stage.trim(),
          ...(updateImageBase64 ? { image: updateImageBase64 } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success('Update published!')
          setStage('')
          setUpdateImageBase64(null)
          setUpdateImagePreview(null)
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to add update')
        },
      },
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div>
        <Label htmlFor="update-stage" className="mb-2 block font-medium">
          Update Title
        </Label>
        <Input
          id="update-stage"
          className="bg-accent"
          placeholder="e.g. Planting Phase Complete, Harvest Season Started..."
          value={stage}
          onChange={(e) => setStage(e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-2 block font-medium">
          Update Image (optional)
        </Label>
        <div className="flex items-center gap-3">
          {updateImagePreview ? (
            <div className="relative w-20 h-14 rounded-md overflow-hidden border border-border">
              <img
                src={updateImagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setUpdateImageBase64(null)
                  setUpdateImagePreview(null)
                }}
                className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition text-sm text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleUpdateImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleAddUpdate}
        disabled={addUpdate.isPending}
        className="w-full sm:w-auto"
      >
        {addUpdate.isPending ? 'Publishing...' : 'Publish Update'}
      </Button>
    </div>
  )
}
