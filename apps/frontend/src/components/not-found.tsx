import { Link } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="space-y-6 max-w-md">
        {/* Illustration or Icon */}
        <div className="relative mx-auto h-40 w-40 flex items-center justify-center rounded-full bg-green-50">
          <div className="absolute inset-0 rounded-full border border-green-100 animate-ping opacity-25" />
          <span className="text-6xl font-bold text-green-600">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">
            Field Not Found
          </h1>
          <p className="text-gray-500">
            Looks like you've ventured too far off the farm. The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild variant="outline" className="gap-2">
            <Link to="..">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
