import { cn } from '@/lib/utils'

interface HuePickerProps {
  value: number
  onChange: (hue: number) => void
  label?: string
  className?: string
}

function HuePicker({ value, onChange, label, className }: HuePickerProps) {
  const swatchColor = `hsl(${value} 70% 50%)`

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="text-xs font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-8 shrink-0 rounded-md border border-border shadow-sm"
          style={{ backgroundColor: swatchColor }}
        />
        <input
          type="range"
          min={0}
          max={360}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="hue-slider h-3 w-full cursor-pointer appearance-none rounded-full outline-none"
          style={{
            background: `linear-gradient(to right,
              hsl(0 70% 50%),
              hsl(60 70% 50%),
              hsl(120 70% 50%),
              hsl(180 70% 50%),
              hsl(240 70% 50%),
              hsl(300 70% 50%),
              hsl(360 70% 50%)
            )`,
          }}
        />
        <span className="w-8 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
          {value}°
        </span>
      </div>
    </div>
  )
}

export { HuePicker }
export type { HuePickerProps }
