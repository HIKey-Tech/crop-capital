import { useInView } from '@/hooks/use-in-view'
import { cn } from '@/lib/utils'

export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  direction = 'up',
  duration = 1000
}: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number,
  direction?: 'up' | 'down' | 'left' | 'right' | 'none',
  duration?: number
}) {
  const { ref, isInView } = useInView({ once: true, threshold: 0.1 })
  
  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: ''
  }

  return (
    <div
      ref={ref as any}
      className={cn(
        'transition-all ease-out opacity-0',
        isInView && 'opacity-100 translate-y-0 translate-x-0',
        !isInView && directionClasses[direction],
        className
      )}
      style={{ 
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}
