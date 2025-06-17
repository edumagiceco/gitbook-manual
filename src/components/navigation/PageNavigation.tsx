'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PageInfo {
  title: string
  path: string
  description?: string
}

interface PageNavigationProps {
  previousPage?: PageInfo
  nextPage?: PageInfo
  currentPage?: {
    title: string
    path: string
  }
  enableKeyboardNavigation?: boolean
  className?: string
}

export default function PageNavigation({
  previousPage,
  nextPage,
  currentPage,
  enableKeyboardNavigation = true,
  className = ""
}: PageNavigationProps) {
  const router = useRouter()

  // Keyboard navigation support
  useEffect(() => {
    if (!enableKeyboardNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Alt + Arrow keys for page navigation
      if (e.altKey) {
        if (e.key === 'ArrowLeft' && previousPage) {
          e.preventDefault()
          router.push(previousPage.path)
        } else if (e.key === 'ArrowRight' && nextPage) {
          e.preventDefault()
          router.push(nextPage.path)
        }
      }

      // Also support [ and ] keys
      if (e.key === '[' && previousPage && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push(previousPage.path)
      } else if (e.key === ']' && nextPage && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push(nextPage.path)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardNavigation, previousPage, nextPage, router])

  if (!previousPage && !nextPage) {
    return null
  }

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 pt-8 mt-12 ${className}`}>
      {/* Page Info (if provided) */}
      {currentPage && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {currentPage.title}
          </h2>
          <p className="text-sm text-gray-500">
            {currentPage.path}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between space-x-4">
        {/* Previous Page */}
        <div className="flex-1">
          {previousPage ? (
            <Link
              href={previousPage.path}
              className="group flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Previous
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {previousPage.title}
                  </div>
                  {previousPage.description && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {previousPage.description}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div></div> // Empty div to maintain flexbox layout
          )}
        </div>

        {/* Current Page Indicator (optional) */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
          <span>•</span>
          <span>•</span>
          <span>•</span>
        </div>

        {/* Next Page */}
        <div className="flex-1">
          {nextPage ? (
            <Link
              href={nextPage.path}
              className="group flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1 text-right">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Next
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {nextPage.title}
                  </div>
                  {nextPage.description && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {nextPage.description}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </Link>
          ) : (
            <div></div> // Empty div to maintain flexbox layout
          )}
        </div>
      </div>

      {/* Keyboard Hints */}
      {enableKeyboardNavigation && (previousPage || nextPage) && (
        <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-400">
          {previousPage && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">Alt</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">←</kbd>
              </div>
              <span>or</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">[</kbd>
              <span>Previous</span>
            </div>
          )}
          {nextPage && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">Alt</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">→</kbd>
              </div>
              <span>or</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">]</kbd>
              <span>Next</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
