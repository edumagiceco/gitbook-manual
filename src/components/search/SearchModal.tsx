'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, FileText, Hash, ArrowRight, Command } from 'lucide-react'
import { siteConfig } from '@/lib/config'

interface SearchResult {
  id: string
  title: string
  content: string
  path: string
  type: 'page' | 'heading' | 'text'
  highlight?: string
  score?: number
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(siteConfig.recentSearchesKey)
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent searches:', e)
      }
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(q => q !== searchQuery)
    ].slice(0, siteConfig.maxRecentSearches)
    
    setRecentSearches(updated)
    localStorage.setItem(siteConfig.recentSearchesKey, JSON.stringify(updated))
  }, [recentSearches])

  // Real search function using API
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), siteConfig.apiTimeout)
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          limit: 20 
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.results) {
        // Transform API results to SearchResult format
        const transformedResults: SearchResult[] = data.results.map((result: {
          id?: string;
          title?: string;
          content?: string;
          description?: string;
          path?: string;
          url?: string;
          type?: string;
          score?: number;
        }, index: number) => ({
          id: result.id || `result-${index}`,
          title: result.title || 'Untitled',
          content: result.content || result.description || '',
          path: result.path || result.url || '#',
          type: (result.type as 'page' | 'heading' | 'text') || 'page',
          highlight: searchQuery,
          score: result.score
        }))
        
        setResults(transformedResults)
      } else {
        console.warn('Search API returned unexpected format:', data)
        setResults([])
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Search request aborted')
      } else {
        console.error('Search failed:', error)
      }
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search with configurable delay
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, siteConfig.searchDebounceMs)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleSelectResult = useCallback((result: SearchResult) => {
    saveRecentSearch(query)
    router.push(result.path)
    onClose()
  }, [saveRecentSearch, query, router, onClose])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex])
        }
        break
    }
  }, [isOpen, onClose, results, selectedIndex, handleSelectResult])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery)
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'page':
        return <FileText className="w-4 h-4" />
      case 'heading':
        return <Hash className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
            autoComplete="off"
            spellCheck="false"
          />
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Results ({results.length})
              </div>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 
                    transition-colors group
                    ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <div className="flex-shrink-0 text-gray-400 mr-3">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {result.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {result.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {result.path}
                      {result.score && (
                        <span className="ml-2 text-blue-500">
                          Score: {result.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Recent Searches
              </div>
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(recentQuery)}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-900 dark:text-gray-100">{recentQuery}</span>
                </button>
              ))}
            </div>
          )}

          {!query && recentSearches.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Command className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start typing to search documentation</p>
              <p className="text-xs mt-1">Use ↑↓ to navigate, Enter to select, ESC to close</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
