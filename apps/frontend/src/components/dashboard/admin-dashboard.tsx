import { Coins, FolderOpen, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import type { ChartConfig } from '@/components/ui/chart'

import { StatsCard } from '@/components/dashboard/stats-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useFarms } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export function AdminDashboard() {
  const { data, error } = useFarms()

  const farms = data?.farms ?? []

  const totalFarms = farms.length
  const openFarms = farms.filter(
    (f) => f.fundedAmount / f.investmentGoal < 1,
  ).length
  const closedFarms = farms.filter(
    (f) => f.fundedAmount / f.investmentGoal >= 1,
  ).length
  const totalFunding = farms.reduce((acc, f) => acc + f.investmentGoal, 0)
  const avgROI = farms.length
    ? (farms.reduce((acc, f) => acc + f.roi, 0) / farms.length).toFixed(1)
    : '0'
  const activeFarms = farms.filter(
    (f) => f.fundedAmount / f.investmentGoal >= 1,
  ).length

  // Chart data: funding progress per farm
  const fundingData = farms.map((f) => ({
    name: f.name.length > 18 ? `${f.name.slice(0, 18)}...` : f.name,
    funded: f.fundedAmount,
    remaining: Math.max(f.investmentGoal - f.fundedAmount, 0),
  }))

  const fundingChartConfig = {
    funded: { label: 'Funded', color: 'hsl(142, 40%, 48%)' }, // brand green
    remaining: { label: 'Remaining', color: 'hsl(38, 70%, 68%)' }, // soft amber
  } satisfies ChartConfig

  // Chart data: status breakdown
  const statusData = [
    { status: 'Active', count: activeFarms, fill: 'hsl(221, 65%, 68%)' }, // soft blue
    { status: 'Funding', count: openFarms, fill: 'hsl(38, 70%, 68%)' }, // soft amber
  ]

  const statusChartConfig = {
    count: { label: 'Farms' },
    Active: { label: 'Active', color: 'hsl(221, 65%, 68%)' }, // soft blue
    Funding: { label: 'Funding', color: 'hsl(38, 70%, 68%)' }, // soft amber
  } satisfies ChartConfig

  // Chart data: ROI comparison
  const roiData = farms.map((f) => ({
    name: f.name.length > 18 ? `${f.name.slice(0, 18)}...` : f.name,
    roi: f.roi,
  }))

  const roiChartConfig = {
    roi: { label: 'ROI %', color: 'hsl(142, 64%, 48%)' }, // brand green
  } satisfies ChartConfig

  // Soft vibrant color palette for ROI bars
  const roiColors = [
    'hsl(221, 65%, 68%)', // soft blue
    'hsl(142, 64%, 48%)', // brand green
    'hsl(280, 60%, 70%)', // soft purple
    'hsl(262, 60%, 68%)', // soft violet
    'hsl(346, 60%, 68%)', // soft rose
    'hsl(217, 60%, 70%)', // soft sky blue
    'hsl(158, 55%, 65%)', // soft teal
    'hsl(24, 70%, 68%)', // soft orange
    'hsl(173, 55%, 65%)', // soft cyan
    'hsl(339, 60%, 70%)', // soft pink
    'hsl(142, 64%, 46%)', // brand green variant
    'hsl(262, 58%, 70%)', // soft lavender
  ]

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">
          Failed to load dashboard. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Total Farms"
          value={totalFarms.toString()}
          icon={<FolderOpen className="w-4 h-4 text-primary" />}
        />
        <StatsCard
          label="Funding Opportunities"
          value={openFarms.toString()}
          trend={openFarms > 0 ? `+ ${openFarms}` : undefined}
          trendLabel={openFarms === 1 ? 'open' : 'open'}
          icon={<TrendingUp className="w-4 h-4 text-primary" />}
        />
        <StatsCard
          label="Total Funding Goal"
          value={formatCurrency(totalFunding)}
          icon={<Coins className="w-4 h-4 text-primary" />}
        />
        <StatsCard
          label="Active Farms"
          value={activeFarms.toString()}
          trend={activeFarms > 0 ? `+ ${activeFarms}` : undefined}
          trendLabel={activeFarms === 1 ? 'active' : 'active'}
        />
        <StatsCard
          label="Closed Farms"
          value={closedFarms.toString()}
          trend={closedFarms > 0 ? `+ ${closedFarms}` : undefined}
          trendLabel={closedFarms === 1 ? 'closed' : 'closed'}
        />
        <StatsCard
          label="Avg. ROI"
          value={`${avgROI}%`}
          icon={<TrendingUp className="w-4 h-4 text-primary" />}
        />
      </div>

      {farms.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funding Progress Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Funding Progress</CardTitle>
              <CardDescription>
                Funded vs remaining amount per farm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={fundingChartConfig}
                className="h-75 w-full"
              >
                <BarChart data={fundingData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `₦${(value / 1_000_000).toFixed(0)}M`
                    }
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="funded"
                    stackId="a"
                    fill="var(--color-funded)"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="remaining"
                    stackId="a"
                    fill="var(--color-remaining)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Farm Status</CardTitle>
              <CardDescription>Active vs Funding breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={statusChartConfig}
                className="mx-auto aspect-square h-62.5"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={4}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalFarms}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy ?? 0) + 24}
                                className="fill-muted-foreground text-sm"
                              >
                                Farms
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* ROI Comparison */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>ROI Comparison</CardTitle>
              <CardDescription>
                Return on investment percentage by farm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={roiChartConfig} className="h-62.5 w-full">
                <BarChart data={roiData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => `${value}%`} />
                    }
                  />
                  <Bar dataKey="roi" radius={6}>
                    {roiData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={roiColors[index % roiColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
