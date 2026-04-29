import { inflect } from 'inflection'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ImagePlus,
  MapPin,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import type {
  CreateCommodityFormValues,
  CreateCommodityInput,
} from '@/api/commodities/schema'
import type { CreateCommodityRequest } from '@/types'

import { createCommoditySchema } from '@/api/commodities/schema'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCommodity, useUpdateCommodity } from '@/hooks'
import { currencyOptions, formatCurrency } from '@/lib/format-currency'

const UNIT_OPTIONS = [
  'Bag',
  'Kg',
  'Ton',
  'Painter',
  '5L Gallon',
  '20L Gallon',
  'Litre',
  'Piece',
  'Carton',
  'Bundle',
  'Crate',
  'Dozen',
]

const CATEGORY_OPTIONS = [
  'Grains & Cereals',
  'Seafood & Fish',
  'Oils & Fats',
  'Nuts & Seeds',
  'Dried Vegetables',
  'Spices & Herbs',
  'Tubers & Roots',
  'Fruits',
  'Livestock',
  'Processed Foods',
  'Other',
]

export const Route = createFileRoute(
  '/$tenant/_authenticated/admin/marketplace/$id/edit',
)({
  component: EditCommodityPage,
})

interface ImagePreview {
  id: number
  url: string
  publicId?: string
  file?: File
  isExisting?: boolean
}

function EditCommodityPage() {
  const { id, tenant } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useCommodity(id)
  const updateCommodity = useUpdateCommodity()
  const [images, setImages] = useState<Array<ImagePreview>>([])
  const [hasImageChanges, setHasImageChanges] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (!data?.commodity) return

    form.setValues({
      name: data.commodity.name,
      category: data.commodity.category,
      description: data.commodity.description ?? '',
      location: data.commodity.location,
      currency: data.commodity.currency,
      unit: data.commodity.unit,
      images: data.commodity.images,
      price: data.commodity.price.toString(),
      availableQuantity: data.commodity.availableQuantity.toString(),
      minimumOrderQuantity: data.commodity.minimumOrderQuantity.toString(),
      isFeatured: data.commodity.isFeatured,
      isPublished: data.commodity.isPublished,
    })

    setImages(
      data.commodity.images.map((url, index) => ({
        id: index + 1,
        url,
        publicId: data.commodity.imagePublicIds[index],
        isExisting: true,
      })),
    )
  }, [data?.commodity])

  const addFiles = useCallback(
    (files: Array<File>) => {
      const remaining = 5 - images.length
      const next = files
        .filter((f: File) => f.type.startsWith('image/'))
        .slice(0, remaining)
        .map((file, i) => ({
          id: Date.now() + i,
          url: URL.createObjectURL(file),
          file,
          isExisting: false,
        }))
      if (!next.length) return
      setImages((curr) => [...curr, ...next])
      setHasImageChanges(true)
    },
    [images.length],
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const removeImage = (idToRemove: number) => {
    setImages((curr) => curr.filter((img) => img.id !== idToRemove))
    setHasImageChanges(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleSubmit = async (values: CreateCommodityInput) => {
    if (images.length === 0) {
      toast.error('Keep at least one image on the listing')
      return
    }

    const updateData: Partial<CreateCommodityRequest> = {
      ...values,
      description: values.description || undefined,
    }

    try {
      await updateCommodity.mutateAsync({
        id,
        data: {
          data: updateData,
          hasImageChanges,
          retainedImagePublicIds: hasImageChanges
            ? images
                .filter(
                  (img): img is ImagePreview & { publicId: string } =>
                    img.isExisting === true && typeof img.publicId === 'string',
                )
                .map((img) => img.publicId)
            : undefined,
          newImages: hasImageChanges
            ? images
                .filter(
                  (img): img is ImagePreview & { file: File } =>
                    img.file instanceof File,
                )
                .map((img) => img.file)
            : undefined,
        },
      })

      toast.success('Marketplace listing updated')
      navigate({ to: '/$tenant/admin/marketplace', params: { tenant } })
    } catch (updateError) {
      console.error('Failed to update commodity', updateError)
      toast.error('Could not update listing')
    }
  }

  if (isLoading) return <LoadingSpinner />

  if (error || !data?.commodity) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Failed to load commodity details.</p>
      </div>
    )
  }

  const {
    name,
    price,
    currency,
    unit,
    location,
    isPublished,
    isFeatured,
    availableQuantity,
    minimumOrderQuantity,
  } = form.values
  const previewPrice = price && !isNaN(Number(price)) ? Number(price) : null

  // If the saved unit isn't in our predefined list, add it so the Select shows correctly
  const unitOptions = UNIT_OPTIONS.includes(unit)
    ? UNIT_OPTIONS
    : unit
      ? [...UNIT_OPTIONS, unit]
      : UNIT_OPTIONS

  const categoryOptions = CATEGORY_OPTIONS.includes(data.commodity.category)
    ? CATEGORY_OPTIONS
    : [...CATEGORY_OPTIONS.slice(0, -1), data.commodity.category, 'Other']

  return (
    <div className="max-w-7xl mx-auto py-8 animate-fade-in px-4 sm:px-8 mb-16">
      <Breadcrumbs
        items={[
          {
            label: 'Marketplace',
            to: '/$tenant/admin/marketplace',
            params: { tenant },
          },
          { label: data.commodity.name },
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/$tenant/admin/marketplace"
          params={{ tenant }}
          className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Edit {data.commodity.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            The preview on the right updates as you make changes.
          </p>
        </div>
      </div>

      <form
        onSubmit={form.onSubmit(handleSubmit, () => {
          requestAnimationFrame(() => {
            document
              .querySelector('[aria-invalid="true"]')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          })
        })}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── Main form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Product images
              </h2>

              {images.length < 5 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Drop images here or{' '}
                    <span className="text-primary underline underline-offset-2">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Up to {5 - images.length} more · JPEG, PNG, WebP
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </div>
              ) : null}

              {images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                  {images.map((img, i) => (
                    <div
                      key={img.id}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-border"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {i === 0 ? (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-md">
                          Cover
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {/* Product details */}
            <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Product details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Product name</Label>
                  <Input
                    id="name"
                    aria-invalid={!!form.errors.name}
                    key={form.key('name')}
                    {...form.getInputProps('name')}
                  />
                  {form.errors.name ? (
                    <p className="text-sm text-destructive">
                      {form.errors.name}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.values.category}
                    onValueChange={(v) => form.setFieldValue('category', v)}
                  >
                    <SelectTrigger
                      id="category"
                      className="w-full"
                      aria-invalid={!!form.errors.category}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.errors.category ? (
                    <p className="text-sm text-destructive">
                      {form.errors.category}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Market location</Label>
                  <Input
                    id="location"
                    key={form.key('location')}
                    {...form.getInputProps('location')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description{' '}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Quality grade, origin, storage requirements…"
                  className="min-h-24 resize-y"
                  key={form.key('description')}
                  {...form.getInputProps('description')}
                />
              </div>
            </section>

            {/* Pricing & stock */}
            <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Pricing & stock
              </h2>

              <div className="space-y-1.5">
                <Label>Price per unit</Label>
                {previewPrice && unit ? (
                  <p className="text-xs text-muted-foreground">
                    Buyers see this as{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(previewPrice, currency)} / {unit}
                    </span>
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Select
                    value={form.values.currency}
                    onValueChange={(v) =>
                      form.setFieldValue('currency', v as any)
                    }
                  >
                    <SelectTrigger className="w-28 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    aria-invalid={!!form.errors.price}
                    className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    key={form.key('price')}
                    {...form.getInputProps('price')}
                  />
                  <Select
                    value={form.values.unit}
                    onValueChange={(v) => form.setFieldValue('unit', v)}
                  >
                    <SelectTrigger
                      className="w-36 shrink-0"
                      aria-invalid={!!form.errors.unit}
                    >
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.errors.price ? (
                  <p className="text-sm text-destructive">
                    {form.errors.price}
                  </p>
                ) : null}
                {form.errors.unit ? (
                  <p className="text-sm text-destructive">{form.errors.unit}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="availableQuantity">Available stock</Label>
                  <div className="relative">
                    <Input
                      id="availableQuantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      aria-invalid={!!form.errors.availableQuantity}
                      key={form.key('availableQuantity')}
                      {...form.getInputProps('availableQuantity')}
                      className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none${unit ? ' pr-16' : ''}`}
                    />
                    {unit ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {inflect(
                          unit,
                          Number(availableQuantity) || 0,
                        )}
                      </span>
                    ) : null}
                  </div>
                  {form.errors.availableQuantity ? (
                    <p className="text-sm text-destructive">
                      {form.errors.availableQuantity}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="minimumOrderQuantity">Minimum order</Label>
                  <div className="relative">
                    <Input
                      id="minimumOrderQuantity"
                      type="number"
                      min="1"
                      placeholder="1"
                      aria-invalid={!!form.errors.minimumOrderQuantity}
                      key={form.key('minimumOrderQuantity')}
                      {...form.getInputProps('minimumOrderQuantity')}
                      className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none${unit ? ' pr-16' : ''}`}
                    />
                    {unit ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {inflect(
                          unit,
                          Number(minimumOrderQuantity) || 1,
                        )}
                      </span>
                    ) : null}
                  </div>
                  {form.errors.minimumOrderQuantity ? (
                    <p className="text-sm text-destructive">
                      {form.errors.minimumOrderQuantity}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Live buyer preview */}
            <section className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Buyer preview
                </p>
              </div>
              <div className="p-4">
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {images[0] ? (
                      <img
                        src={images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-muted-foreground/40">
                        <ImagePlus className="h-8 w-8" />
                        <p className="text-xs">No image yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="font-semibold text-sm text-foreground line-clamp-2">
                      {name || (
                        <span className="text-muted-foreground italic font-normal">
                          Product name
                        </span>
                      )}
                    </p>
                    {previewPrice ? (
                      <p className="text-xs font-medium text-emerald-600">
                        {formatCurrency(previewPrice, currency)}
                        {unit ? ` / ${unit}` : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Set a price
                      </p>
                    )}
                    {location ? (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {location}
                      </p>
                    ) : null}
                    <div className="pt-1.5">
                      <div className="h-8 rounded-lg bg-emerald-600 flex items-center justify-center gap-1.5 text-xs text-white font-medium">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Visibility */}
            <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Visibility
              </p>
              <button
                type="button"
                onClick={() => form.setFieldValue('isPublished', !isPublished)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  isPublished
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-border bg-background text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isPublished ? (
                    <Eye className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  {isPublished
                    ? 'Live — visible to buyers'
                    : 'Draft — not visible yet'}
                </span>
                <div
                  className={`h-5 w-9 rounded-full transition-colors relative shrink-0 ${
                    isPublished ? 'bg-emerald-500' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      isPublished ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => form.setFieldValue('isFeatured', !isFeatured)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  isFeatured
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-border bg-background text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles
                    className={`h-4 w-4 ${isFeatured ? 'text-amber-500' : 'text-muted-foreground'}`}
                  />
                  {isFeatured ? 'Featured listing' : 'Not featured'}
                </span>
                <div
                  className={`h-5 w-9 rounded-full transition-colors relative shrink-0 ${
                    isFeatured ? 'bg-amber-400' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      isFeatured ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={updateCommodity.isPending}
                className="w-full h-11 text-sm font-semibold btn-primary-gradient"
              >
                {updateCommodity.isPending ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                asChild
                type="button"
                variant="ghost"
                className="w-full h-10 text-sm"
              >
                <Link to="/$tenant/admin/marketplace" params={{ tenant }}>
                  Cancel
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
