'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Command } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  showShortcut?: boolean
}

export default function SearchBar({ 
  placeholder = "Search documentation...", 
  className = "",
  onSearch,
  showShortcut = true 
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isFocused, setIsFocused] = useState(false)

  // Create query string for URL
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = useCallback((searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    
    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      // Navigate to search results page
      const queryString = createQueryString('q', trimmedQuery)
      router.push(trimmedQuery ? `/search?${queryString}` : '/search')
    }
  }, [onSearch, createQueryString, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('')
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const clearSearch = () => {
    setQuery('')
    handleSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full max-w-md ${className}`}>
      <div className={`
        relative flex items-center w-full rounded-lg border bg-white dark:bg-gray-800 
        transition-all duration-200 
        ${isFocused 
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
      `}>
        {/* Search Icon */}
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        
        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-12 py-2.5 bg-transparent border-0 
            text-gray-900 dark:text-gray-100 placeholder-gray-500 
            focus:outline-none focus:ring-0
          "
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-8 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {showShortcut && !isFocused && !query && (
          <div className="absolute right-3 flex items-center space-x-1 text-xs text-gray-400">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        )}
      </div>
    </form>
  )
}
