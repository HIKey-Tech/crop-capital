import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { ViewMode } from '@/lib/api-client'
import { getViewMode, setViewMode as storeViewMode } from '@/lib/api-client'

interface ViewModeContextValue {
  viewMode: ViewMode
  isAdmin: boolean
  toggleViewMode: () => void
  setViewMode: (mode: ViewMode) => void
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null)

interface ViewModeProviderProps {
  userRole: 'admin' | 'investor'
  children: ReactNode
}

export function ViewModeProvider({
  userRole,
  children,
}: ViewModeProviderProps) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Only admins can have admin view mode
    if (userRole !== 'admin') return 'investor'
    return getViewMode() || 'investor'
  })

  const isAdmin = userRole === 'admin'

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      // Investors can never switch to admin view
      if (!isAdmin && mode === 'admin') return
      setViewModeState(mode)
      storeViewMode(mode)
    },
    [isAdmin],
  )

  const toggleViewMode = useCallback(() => {
    if (!isAdmin) return
    setViewMode(viewMode === 'admin' ? 'investor' : 'admin')
  }, [isAdmin, viewMode, setViewMode])

  const value = useMemo(
    () => ({ viewMode, isAdmin, toggleViewMode, setViewMode }),
    [viewMode, isAdmin, toggleViewMode, setViewMode],
  )

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}
