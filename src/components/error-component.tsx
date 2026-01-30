import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorComponentProps {
    error?: Error | null
    title?: string
    message?: string
    resetErrorBoundary?: () => void
}

export function ErrorComponent({
    error,
    title = "Application Error",
    message = "Something went wrong while loading this page.",
    resetErrorBoundary
}: ErrorComponentProps) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-border p-8 text-center animate-fade-in shadow-sm">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    {message}
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-left mb-6 overflow-hidden">
                        <p className="text-xs font-mono text-red-800 break-all">
                            {error.message || 'Unknown error occurred'}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                        <Home className="mr-2 h-4 w-4" /> Go to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => resetErrorBoundary ? resetErrorBoundary() : window.location.reload()} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
            </div>
        </div>
    )
}
