import { Component } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-muted-foreground mb-6 text-sm">
                            We encountered an unexpected error. Our team has been notified.
                        </p>

                        {this.state.error && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-left mb-6 overflow-hidden">
                                <p className="text-xs font-mono text-red-800 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button onClick={() => window.location.reload()} className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4" /> Reload Page
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <a href="/dashboard">Go Home</a>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Named export for TanStack Router errorComponent
export function GlobalErrorComponent({ error }: { error: Error }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Application Error</h1>
                <p className="text-muted-foreground mb-6 text-sm">
                    Something went wrong while loading this page.
                </p>

                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-left mb-6 overflow-hidden">
                    <p className="text-xs font-mono text-red-800 break-all">
                        {error.message || 'Unknown error occurred'}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                        <Home className="mr-2 h-4 w-4" /> Go to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
            </div>
        </div>
    )
}
