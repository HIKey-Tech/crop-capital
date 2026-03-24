import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean
}

export function useInView(options: UseInViewOptions = {}) {
  const { once = true, ...observerOptions } = options
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        if (once) observer.unobserve(element)
      } else if (!once) {
        setIsInView(false)
      }
    }, observerOptions)

    observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [once, observerOptions])

  return { ref, isInView }
}
