import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon
    title: string
    description?: string
    action?: React.ReactNode
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center',
                className
            )}
            {...props}
        >
            {Icon && (
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
                <p className="mb-4 mt-2 max-w-sm text-sm text-gray-500">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
