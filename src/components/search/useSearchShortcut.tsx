'use client'

import { useEffect } from 'react'

interface UseSearchShortcutProps {
  onToggle: () => void
  disabled?: boolean
}

export function useSearchShortcut({ onToggle, disabled = false }: UseSearchShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!disabled) {
          onToggle()
        }
      }

      // Also support Cmd+/ or Ctrl+/
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        if (!disabled) {
          onToggle()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onToggle, disabled])
}

// Global search provider component
interface GlobalSearchProviderProps {
  children: React.ReactNode
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const toggleSearch = () => {
    // Search modal toggle logic will be handled by the consuming component
  }

  useSearchShortcut({ 
    onToggle: toggleSearch,
    disabled: false
  })

  return (
    <>
      {children}
      {/* Search Modal will be rendered here via portal or context */}
    </>
  )
}
