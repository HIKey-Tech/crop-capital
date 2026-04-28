import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { ArrowLeft, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import type {
  CreateCommodityFormValues,
  CreateCommodityInput,
} from '@/api/commodities/schema'

import { createCommoditySchema } from '@/api/commodities/schema'
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
import { Textarea } from '@/components/ui/textarea'
import { useCreateCommodity } from '@/hooks'
import { currencyOptions } from '@/lib/format-currency'

export const Route = createFileRoute(
  '/$tenant/_authenticated/admin/marketplace/new',
)({
  component: NewCommodityPage,
})

interface ImagePreview {
  id: number
  url: string
  file: File
}

function NewCommodityPage() {
  const { tenant } = Route.useParams()
  const navigate = useNavigate()
  const createCommodity = useCreateCommodity()
  const [images, setImages] = useState<Array<ImagePreview>>([])

  const form = useForm<
    CreateCommodityFormValues,
    (values: CreateCommodityFormValues) => CreateCommodityInput
  >({
    initialValues: {
      name: '',
      category: '',
      description: '',
      location: '',
      currency: 'NGN',
      unit: '',
      images: [],
      price: '',
      availableQuantity: '',
      minimumOrderQuantity: '1',
      isFeatured: false,
      isPublished: true,
    },
    validate: zodResolver(createCommoditySchema),
    transformValues: (values) => createCommoditySchema.parse(values),
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return

    const files = Array.from(event.target.files)
    const remaining = 5 - images.length
    const nextImages = files.slice(0, remaining).map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      file,
    }))

    setImages((current) => [...current, ...nextImages])
    nextImages.forEach((image) => form.insertListItem('images', image.url))
    form.clearFieldError('images')
  }

  const removeImage = (id: number) => {
    const index = images.findIndex((image) => image.id === id)
    if (index < 0) return

    setImages((current) => current.filter((image) => image.id !== id))
    form.removeListItem('images', index)
  }

  const handleSubmit = async (values: CreateCommodityInput) => {
    if (images.length === 0) {
      toast.error('Add at least one image before publishing a commodity')
      return
    }

    try {
      await createCommodity.mutateAsync({
        data: {
          ...values,
          description: values.description || undefined,
        },
        images: images.map((image) => image.file),
      })

      toast.success('Commodity listing created')
      navigate({ to: '/$tenant/admin/marketplace', params: { tenant } })
    } catch (createError) {
      console.error('Failed to create commodity', createError)
      toast.error('Could not create listing')
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-12 animate-fade-in px-4 sm:px-8">
      <Breadcrumbs
        items={[
          {
            label: 'Marketplace',
            to: '/$tenant/admin/marketplace',
            params: { tenant },
          },
          { label: 'New Listing' },
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-10">
        <Link
          to="/$tenant/admin/marketplace"
          params={{ tenant }}
          className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          New marketplace listing
        </h1>
      </div>

      <form
        className="space-y-0 rounded-2xl border border-border bg-card shadow-sm"
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <div className="p-8 pb-4">
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Commodity name
                </Label>
                <Input
                  id="name"
                  key={form.key('name')}
                  {...form.getInputProps('name')}
                />
                {form.errors.name ? (
                  <p className="mt-1 text-sm text-destructive">
                    {form.errors.name}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Category
                </Label>
                <Input
                  id="category"
                  key={form.key('category')}
                  {...form.getInputProps('category')}
                />
                {form.errors.category ? (
                  <p className="mt-1 text-sm text-destructive">
                    {form.errors.category}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Market location
                </Label>
                <Input
                  id="location"
                  key={form.key('location')}
                  {...form.getInputProps('location')}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="unit"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Sales unit
                </Label>
                <Input
                  id="unit"
                  key={form.key('unit')}
                  {...form.getInputProps('unit')}
                />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
              Financial Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="currency"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Currency
                </Label>
                <Select
                  value={form.values.currency}
                  onValueChange={(value) =>
                    form.setFieldValue('currency', value as any)
                  }
                >
                  <SelectTrigger id="currency" className="w-full">
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
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Price per unit
                </Label>
                <Input
                  id="price"
                  key={form.key('price')}
                  {...form.getInputProps('price')}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="availableQuantity"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Available quantity
                </Label>
                <Input
                  id="availableQuantity"
                  key={form.key('availableQuantity')}
                  {...form.getInputProps('availableQuantity')}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="minimumOrderQuantity"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Minimum order quantity
                </Label>
                <Input
                  id="minimumOrderQuantity"
                  key={form.key('minimumOrderQuantity')}
                  {...form.getInputProps('minimumOrderQuantity')}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
              Description
            </h2>
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="mb-2 block font-medium tracking-tight"
              >
                Description
              </Label>
              <Textarea
                id="description"
                key={form.key('description')}
                {...form.getInputProps('description')}
              />
            </div>
          </div>
        </div>

        <div className="px-8 pb-4">
          <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
            Listing images
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Upload images</p>
                <p className="text-sm text-muted-foreground">
                  Up to five images
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-2xl border border-border"
                >
                  <img
                    src={image.url}
                    alt="Commodity preview"
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1"
                    onClick={() => removeImage(image.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <section className="flex flex-wrap gap-6 rounded-2xl border border-border bg-background p-4">
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.values.isFeatured}
                onChange={(event) =>
                  form.setFieldValue('isFeatured', event.currentTarget.checked)
                }
              />
              Feature this listing
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.values.isPublished}
                onChange={(event) =>
                  form.setFieldValue('isPublished', event.currentTarget.checked)
                }
              />
              Publish immediately
            </label>
          </section>

          <div className="flex justify-end gap-3 mt-8">
            <Link to="/$tenant/admin/marketplace" params={{ tenant }}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createCommodity.isPending}
              className="btn-primary-gradient h-12 px-10 text-base font-semibold rounded-lg focus:outline-none shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCommodity.isPending ? 'Saving...' : 'Create listing'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
