import { useForm } from '@mantine/form'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ShoppingBasket, Store, Tag, Trash2, Truck } from 'lucide-react'
import { zodResolver } from 'mantine-form-zod-resolver'
import { toast } from 'sonner'
import { z } from 'zod'

import type { UseFormReturnType } from '@mantine/form'
import type { Commodity } from '@/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useTenant } from '@/contexts/tenant'
import { useCommodities, useCreateCommodityOrder } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/$tenant/_authenticated/marketplace/')({
  component: MarketplacePage,
})

const checkoutSchema = z.object({
  contactPhone: z.string(),
  deliveryAddress: z.string(),
  customerNote: z.string(),
})

type CheckoutValues = z.infer<typeof checkoutSchema>

interface CartItem {
  listingId: string
  quantity: number
}

function MarketplacePage() {
  const { tenant } = Route.useParams()
  const { tenant: tenantConfig } = useTenant()
  const { data, isLoading, error } = useCommodities()
  const createOrder = useCreateCommodityOrder()

  const cartStorageKey = `marketplace-cart:${tenant}`
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState<Array<CartItem>>([])
  const [cartOpen, setCartOpen] = useState(false)

  const form = useForm<CheckoutValues>({
    initialValues: { contactPhone: '', deliveryAddress: '', customerNote: '' },
    validate: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    const saved = window.localStorage.getItem(cartStorageKey)

    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as Array<CartItem>
      setCart(Array.isArray(parsed) ? parsed : [])
    } catch {
      window.localStorage.removeItem(cartStorageKey)
    }
  }, [cartStorageKey])

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart))
  }, [cart, cartStorageKey])

  const commodities = useMemo(
    () =>
      (data?.commodities ?? []).filter((commodity) => commodity.isPublished),
    [data?.commodities],
  )

  const categories = useMemo(
    () => [
      'all',
      ...new Set(commodities.map((commodity) => commodity.category)),
    ],
    [commodities],
  )

  const filteredCommodities = useMemo(() => {
    return commodities.filter((commodity) => {
      const matchesSearch =
        commodity.name.toLowerCase().includes(search.toLowerCase()) ||
        commodity.location.toLowerCase().includes(search.toLowerCase()) ||
        commodity.category.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        category === 'all' ? true : commodity.category === category

      return matchesSearch && matchesCategory
    })
  }, [category, commodities, search])

  const cartItems = useMemo(() => {
    return cart
      .map((item) => {
        const commodity = commodities.find(
          (entry) => entry._id === item.listingId,
        )

        if (!commodity) return null

        return {
          commodity,
          quantity: item.quantity,
          lineTotal: commodity.price * item.quantity,
        }
      })
      .filter(Boolean) as Array<{
      commodity: Commodity
      quantity: number
      lineTotal: number
    }>
  }, [cart, commodities])

  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)

  const updateCart = (listing: Commodity, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      setCart((current) =>
        current.filter((item) => item.listingId !== listing._id),
      )
      return
    }

    if (nextQuantity > listing.availableQuantity) {
      toast.error(`Only ${listing.availableQuantity} ${listing.unit} available`)
      return
    }

    setCart((current) => {
      const existing = current.find((item) => item.listingId === listing._id)

      if (!existing) {
        return [...current, { listingId: listing._id, quantity: nextQuantity }]
      }

      return current.map((item) =>
        item.listingId === listing._id
          ? { ...item, quantity: nextQuantity }
          : item,
      )
    })
  }

  const addToCart = (listing: Commodity) => {
    const existing = cart.find((item) => item.listingId === listing._id)
    const minimum = Math.max(1, listing.minimumOrderQuantity)
    const nextQuantity = existing ? existing.quantity + 1 : minimum

    updateCart(listing, nextQuantity)
  }

  const removeFromCart = (listingId: string) => {
    setCart((current) => current.filter((item) => item.listingId !== listingId))
  }

  const handleCheckout = async () => {
    if (!cartItems.length) {
      toast.error('Add at least one commodity to place an order')
      return
    }

    try {
      const { contactPhone, deliveryAddress, customerNote } = form.values

      const response = await createOrder.mutateAsync({
        items: cartItems.map((item) => ({
          listingId: item.commodity._id,
          quantity: item.quantity,
        })),
        contactPhone: contactPhone || undefined,
        deliveryAddress: deliveryAddress || undefined,
        customerNote: customerNote || undefined,
      })

      setCart([])
      form.reset()
      setCartOpen(false)

      if (response.authorizationUrl) {
        window.location.href = response.authorizationUrl
        return
      }

      toast.error('Payment initialization failed. Please try again.')
    } catch (checkoutError) {
      console.error('Failed to place marketplace order', checkoutError)
      toast.error(
        'Could not submit your order. Please review quantities and try again.',
      )
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Failed to load marketplace listings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-4 pb-10 animate-fade-in">
      <section className="rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge className="w-fit border border-emerald-200 bg-emerald-50 text-emerald-800">
              {tenantConfig.displayName} marketplace
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Buy commodities from {tenantConfig.displayName} direct
            </h1>
            <p className="text-base text-muted-foreground">
              Browse verified listings, build a cart, and send a structured
              order directly to the {tenantConfig.displayName} operations team.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Live listings
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {commodities.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Categories
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {categories.length - 1}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Cart value
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {cartItems[0]
                  ? formatCurrency(subtotal, cartItems[0].commodity.currency)
                  : 'Empty'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search commodity, category, or market"
              className="md:max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              {categories.map((entry) => (
                <Button
                  key={entry}
                  type="button"
                  variant={entry === category ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => setCategory(entry)}
                >
                  {entry === 'all' ? 'All categories' : entry}
                </Button>
              ))}
            </div>
          </div>

          {filteredCommodities.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredCommodities.map((commodity) => {
                const currentQuantity =
                  cart.find((item) => item.listingId === commodity._id)
                    ?.quantity ?? 0

                return (
                  <article
                    key={commodity._id}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                  >
                    <div className="relative aspect-4/3 bg-muted">
                      <img
                        src={commodity.images[0]}
                        alt={commodity.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-4 top-4 flex gap-2">
                        {commodity.isFeatured ? (
                          <Badge className="bg-background/90 text-foreground">
                            Featured
                          </Badge>
                        ) : null}
                        <Badge className="bg-background/90 text-foreground">
                          {commodity.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">
                              {commodity.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {commodity.description ||
                                `Listed by ${tenantConfig.displayName}.`}
                            </p>
                          </div>
                          <Tag className="h-5 w-5 text-primary" />
                        </div>

                        <p className="text-2xl font-semibold text-foreground">
                          {formatCurrency(commodity.price, commodity.currency)}
                          <span className="text-sm font-medium text-muted-foreground">
                            {' '}
                            / {commodity.unit}
                          </span>
                        </p>
                      </div>

                      <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          <span>{commodity.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-primary" />
                          <span>
                            {commodity.availableQuantity} {commodity.unit}{' '}
                            available
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                          Min order: {commodity.minimumOrderQuantity}{' '}
                          {commodity.unit}
                        </p>
                        {currentQuantity > 0 ? (
                          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateCart(
                                  commodity,
                                  Math.max(
                                    commodity.minimumOrderQuantity,
                                    currentQuantity - 1,
                                  ),
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="min-w-8 text-center text-sm font-medium">
                              {currentQuantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateCart(commodity, currentQuantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        disabled={commodity.availableQuantity < 1}
                        onClick={() => addToCart(commodity)}
                      >
                        {commodity.availableQuantity < 1
                          ? 'Out of stock'
                          : 'Add to cart'}
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="No commodities found"
              description="Try a different search term or category filter."
              icon={Store}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setCategory('all')
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          )}
        </section>

        <aside className="hidden space-y-4 xl:block xl:sticky xl:top-6 xl:self-start">
          <CartPanel
            cartItems={cartItems}
            subtotal={subtotal}
            form={form}
            isPending={createOrder.isPending}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
          />
        </aside>
      </div>

      {cartItems.length > 0 ? (
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 xl:hidden">
              <Button className="btn-primary-gradient h-12 gap-3 rounded-full px-6 shadow-lg">
                <ShoppingBasket className="h-5 w-5" />
                <span className="font-semibold">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
                <span className="text-white/70">·</span>
                <span>
                  {cartItems[0]
                    ? formatCurrency(subtotal, cartItems[0].commodity.currency)
                    : ''}
                </span>
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[90dvh] overflow-y-auto rounded-t-3xl px-5 pb-8"
          >
            <SheetHeader className="mb-4">
              <SheetTitle>Order cart</SheetTitle>
            </SheetHeader>
            <CartPanel
              cartItems={cartItems}
              subtotal={subtotal}
              form={form}
              isPending={createOrder.isPending}
              onRemove={removeFromCart}
              onCheckout={handleCheckout}
            />
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  )
}

interface CartPanelProps {
  cartItems: Array<{
    commodity: Commodity
    quantity: number
    lineTotal: number
  }>
  subtotal: number
  form: UseFormReturnType<CheckoutValues>
  isPending: boolean
  onRemove: (listingId: string) => void
  onCheckout: () => void
}

function CartPanel({
  cartItems,
  subtotal,
  form,
  isPending,
  onRemove,
  onCheckout,
}: CartPanelProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Order cart</h2>
          <p className="text-sm text-muted-foreground">
            Review quantities and submit your order to the tenant team.
          </p>
        </div>
        <ShoppingBasket className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-5 space-y-3">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div
              key={item.commodity._id}
              className="rounded-2xl border border-border bg-background p-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.commodity.images[0]}
                  alt={item.commodity.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {item.commodity.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.commodity.unit}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatCurrency(item.lineTotal, item.commodity.currency)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.commodity.name}`}
                  onClick={() => onRemove(item.commodity._id)}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="Cart is empty"
            description="Add marketplace commodities to start an order."
            icon={ShoppingBasket}
          />
        )}
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-base font-semibold text-foreground">
            {cartItems[0]
              ? formatCurrency(subtotal, cartItems[0].commodity.currency)
              : '0'}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <Input
            {...form.getInputProps('contactPhone')}
            placeholder="Contact phone"
          />
          <Textarea
            {...form.getInputProps('deliveryAddress')}
            placeholder="Delivery address or pickup instruction"
          />
          <Textarea
            {...form.getInputProps('customerNote')}
            placeholder="Additional note for the seller"
          />
        </div>

        <Button
          type="button"
          className="mt-5 w-full"
          disabled={isPending || cartItems.length === 0}
          onClick={onCheckout}
        >
          {isPending ? 'Submitting order...' : 'Submit order'}
        </Button>
      </div>
    </div>
  )
}
