import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, XCircle } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import farmPalmTrees from '@/assets/farm-palm-trees.jpg'

export const Route = createFileRoute('/admin/farm/new')({
  component: AddNewInvestment,
})

interface ImagePreview {
  id: number
  url: string
}

function AddNewInvestment() {
  const [form, setForm] = useState({
    opportunityName: '',
    location: '',
    productType: '',
    description: '',
    targetAmount: '',
    projectedRoi: '',
    investmentDuration: '',
    plantingLocation: '',
    minInvestment: '',
    size: '',
    harvestTime: '',
  })

  const [images, setImages] = useState<Array<ImagePreview>>([
    { id: 1, url: farmPalmTrees },
    { id: 2, url: farmPalmTrees },
  ])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newImgs = files.map((file, idx) => ({
      id: Date.now() + idx,
      url: URL.createObjectURL(file),
    }))
    setImages([...images, ...newImgs])
  }

  function handleRemoveImage(id: number) {
    setImages((imgs) => imgs.filter((img) => img.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('Opportunity Created!')
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-5xl mx-auto py-12 animate-fade-in px-4 sm:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-foreground tracking-tight">
          Add New Investment Opportunity
        </h1>
        <form
          className="space-y-0 bg-white rounded-2xl border border-border shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="p-8 pb-4 md:pb-4">
            {/* Section: Basic Information */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-2">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="opportunityName"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Opportunity Name
                  </Label>
                  <Input
                    id="opportunityName"
                    name="opportunityName"
                    value={form.opportunityName}
                    onChange={handleChange}
                    placeholder="Green Palm Trees Farm"
                    className="bg-accent"
                    required
                  />
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
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Monrovia, Liberia"
                    className="bg-accent"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="productType"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Product Type
                  </Label>
                  <Input
                    id="productType"
                    name="productType"
                    value={form.productType}
                    onChange={handleChange}
                    placeholder="Palm Nuts"
                    className="bg-accent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section: Description */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Description
              </h2>
              <div>
                <Label
                  htmlFor="description"
                  className="mb-2 block font-medium tracking-tight"
                >
                  Opportunity Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="min-h-[96px] block w-full border border-border rounded-lg px-3 py-2 text-base text-foreground resize-vertical mb-1"
                  placeholder="Describe your opportunity here…"
                  required
                />
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
                    htmlFor="targetAmount"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Target Amount
                  </Label>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.targetAmount}
                    onChange={handleChange}
                    placeholder="50,000"
                    className="bg-accent"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="projectedRoi"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Projected ROI{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      (%)
                    </span>
                  </Label>
                  <Input
                    id="projectedRoi"
                    name="projectedRoi"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.projectedRoi}
                    onChange={handleChange}
                    placeholder="15"
                    className="bg-accent"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="investmentDuration"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Duration{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      (months)
                    </span>
                  </Label>
                  <Input
                    id="investmentDuration"
                    name="investmentDuration"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.investmentDuration}
                    onChange={handleChange}
                    placeholder="6"
                    className="bg-accent"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="plantingLocation"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Planting Location
                  </Label>
                  <Input
                    id="plantingLocation"
                    name="plantingLocation"
                    value={form.plantingLocation}
                    onChange={handleChange}
                    placeholder="Volta Region, Ghana"
                    className="bg-accent"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="minInvestment"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Min Investment
                  </Label>
                  <Input
                    id="minInvestment"
                    name="minInvestment"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.minInvestment}
                    onChange={handleChange}
                    placeholder="100"
                    className="bg-accent"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="size"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Size
                  </Label>
                  <Input
                    id="size"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="in acres"
                    className="bg-accent"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="harvestTime"
                    className="mb-2 block font-medium tracking-tight"
                  >
                    Harvest Time
                  </Label>
                  <Input
                    id="harvestTime"
                    name="harvestTime"
                    value={form.harvestTime}
                    onChange={handleChange}
                    placeholder="October 2024"
                    className="bg-accent"
                    required
                  />
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
                className="h-12 px-10 text-base font-semibold bg-primary text-white border border-primary rounded-lg hover:bg-primary/90 active:bg-primary/80 focus:outline-none shadow"
              >
                Create Opportunity
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
