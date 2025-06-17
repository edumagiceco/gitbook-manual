'use client'

import React, { useEffect, useRef } from 'react'

// Skip to main content link for accessibility
export function SkipLink({ href = '#main-content' }: { href?: string }) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        z-50 bg-blue-600 text-white px-4 py-2 rounded-md font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
    >
      Skip to main content
    </a>
  )
}

// Focus trap for modals and overlays
interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  restoreFocus?: boolean
}

export function FocusTrap({ children, active, restoreFocus = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus the first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus to the previously active element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [active, restoreFocus])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// Screen reader only text
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  className?: string
}

export function ScreenReaderOnly({ children, className = '' }: ScreenReaderOnlyProps) {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  )
}

// Accessible heading with proper hierarchy
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
  id?: string
}

export function AccessibleHeading({ level, children, className = '', id }: AccessibleHeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  return (
    <Tag 
      id={id} 
      className={className}
      tabIndex={-1} // Allow programmatic focus
    >
      {children}
    </Tag>
  )
}

// Landmark regions for better navigation
interface LandmarkProps {
  children: React.ReactNode
  label?: string
  className?: string
}

export function MainLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <main 
      id="main-content"
      aria-label={label}
      className={className}
      tabIndex={-1}
    >
      {children}
    </main>
  )
}

export function NavigationLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <nav 
      aria-label={label}
      className={className}
    >
      {children}
    </nav>
  )
}

export function ComplementaryLandmark({ children, label, className = '' }: LandmarkProps) {
  return (
    <aside 
      aria-label={label}
      className={className}
    >
      {children}
    </aside>
  )
}

// Accessible button with loading state
interface AccessibleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}

export function AccessibleButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  className = '',
  type = 'button',
  'aria-label': ariaLabel,
  ...props 
}: AccessibleButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
      {children}
    </button>
  )
}

// High contrast mode detection hook
export function useHighContrastMode() {
  const isHighContrast = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-contrast: high)').matches

  return isHighContrast
}

// Reduced motion detection hook
export function useReducedMotion() {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return prefersReducedMotion
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}
