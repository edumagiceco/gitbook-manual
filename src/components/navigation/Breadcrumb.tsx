'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  title: string
  path?: string
  isActive?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  className?: string
  maxItems?: number
}

export default function Breadcrumb({
  items,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  showHome = true,
  className = "",
  maxItems
}: BreadcrumbProps) {
  // Add home item if enabled
  const breadcrumbItems = showHome 
    ? [{ title: 'Home', path: '/', isActive: false }, ...items]
    : items

  // Truncate items if maxItems is specified
  const displayItems = maxItems && breadcrumbItems.length > maxItems
    ? [
        ...breadcrumbItems.slice(0, 1), // Keep first item
        { title: '...', path: undefined, isActive: false }, // Ellipsis
        ...breadcrumbItems.slice(-(maxItems - 2)) // Keep last items
      ]
    : breadcrumbItems

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isEllipsis = item.title === '...'

          return (
            <li key={`${item.path}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mr-2 flex-shrink-0">
                  {separator}
                </span>
              )}
              
              {isEllipsis ? (
                <span className="text-gray-400 px-2">...</span>
              ) : item.path && !isLast ? (
                <Link
                  href={item.path}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors hover:underline"
                >
                  {item.title === 'Home' && showHome ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    <span>{item.title}</span>
                  )}
                </Link>
              ) : (
                <span 
                  className={`
                    ${isLast 
                      ? 'text-gray-900 dark:text-gray-100 font-medium' 
                      : 'text-gray-600 dark:text-gray-400'
                    }
                  `}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.title === 'Home' && showHome ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    item.title
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Utility function to generate breadcrumb items from path
export function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  
  return segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const isActive = index === segments.length - 1
    
    // Convert slug to title (replace hyphens with spaces and capitalize)
    const title = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return {
      title,
      path: isActive ? undefined : path,
      isActive
    }
  })
}
