import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'blue' | 'gray' | 'white'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  blue: 'border-blue-500 border-t-transparent',
  gray: 'border-gray-300 border-t-transparent dark:border-gray-600',
  white: 'border-white border-t-transparent'
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  color = 'blue' 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Loading skeleton for content
interface LoadingSkeletonProps {
  lines?: number
  className?: string
  showAvatar?: boolean
}

export function LoadingSkeleton({ 
  lines = 3, 
  className = '',
  showAvatar = false 
}: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-gray-300 dark:bg-gray-600 rounded',
                i === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading card skeleton
export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div className={cn('animate-pulse p-6 border border-gray-200 dark:border-gray-700 rounded-lg', className)}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  )
}

// Loading page overlay
interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  className = '' 
}: LoadingOverlayProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  )
}
