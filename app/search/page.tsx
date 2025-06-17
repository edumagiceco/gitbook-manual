'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchBar from '@/components/search/SearchBar'
import SearchResults from '@/components/search/SearchResults'
import Breadcrumb from '@/components/navigation/Breadcrumb'

interface SearchResult {
  id: string
  title: string
  content: string
  path: string
  type: 'page' | 'heading' | 'text'
  excerpt?: string
  lastModified?: string
  matchCount?: number
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTime, setSearchTime] = useState<number>()
  const [totalResults, setTotalResults] = useState<number>()

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([])
        setSearchTime(undefined)
        setTotalResults(undefined)
        return
      }

      setIsLoading(true)
      const startTime = Date.now()

      try {
        // Simulate API call - replace with actual search implementation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock search results
        const mockResults: SearchResult[] = [
          {
            id: '1',
            title: 'Getting Started with GitBook',
            content: 'Learn how to set up and configure your GitBook workspace for the first time.',
            path: '/docs/getting-started',
            type: 'page' as const,
            excerpt: 'This guide will walk you through the initial setup process and help you understand the basic concepts.',
            lastModified: '2 days ago',
            matchCount: 3
          },
          {
            id: '2',
            title: 'API Reference Documentation',
            content: 'Complete API documentation for developers building integrations.',
            path: '/docs/api',
            type: 'page' as const,
            excerpt: 'Explore our REST API endpoints, authentication methods, and response formats.',
            lastModified: '1 week ago',
            matchCount: 1
          },
          {
            id: '3',
            title: 'Configuration Options',
            content: 'All available configuration options for customizing your project.',
            path: '/docs/config',
            type: 'heading' as const,
            excerpt: 'Customize themes, plugins, and behavior settings to match your needs.',
            lastModified: '3 days ago',
            matchCount: 2
          },
          {
            id: '4',
            title: 'Advanced Features',
            content: 'Explore advanced features like custom domains, analytics, and integrations.',
            path: '/docs/advanced',
            type: 'page' as const,
            excerpt: 'Take your documentation to the next level with these powerful features.',
            lastModified: '5 days ago',
            matchCount: 1
          },
          {
            id: '5',
            title: 'Troubleshooting Guide',
            content: 'Common issues and their solutions for a smooth experience.',
            path: '/docs/troubleshooting',
            type: 'page' as const,
            excerpt: 'Find solutions to common problems and learn how to debug issues.',
            lastModified: '1 day ago',
            matchCount: 2
          }
        ].filter(result => 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.content.toLowerCase().includes(query.toLowerCase()) ||
          result.excerpt?.toLowerCase().includes(query.toLowerCase())
        )

        const endTime = Date.now()
        setResults(mockResults)
        setSearchTime(endTime - startTime)
        setTotalResults(mockResults.length)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
        setSearchTime(undefined)
        setTotalResults(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [query])

  const breadcrumbItems = [
    { title: 'Search', path: '/search', isActive: query ? false : true },
    ...(query ? [{ title: `"${query}"`, isActive: true }] : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Search Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Find answers, guides, and references across all documentation.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar 
              placeholder="Search for anything..."
              className="w-full"
              showShortcut={false}
            />
          </div>
        </div>

        {/* Search Results */}
        <SearchResults
          query={query}
          results={results}
          isLoading={isLoading}
          totalResults={totalResults}
          searchTime={searchTime}
        />

        {/* Search Tips (when no query) */}
        {!query && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Search Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Search Operators</h3>
                <ul className="space-y-1">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">&quot;exact phrase&quot;</code> - Exact match</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">word1 word2</code> - All words</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">word1 OR word2</code> - Either word</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {['getting started', 'API', 'configuration', 'troubleshooting'].map(term => (
                    <button
                      key={term}
                      onClick={() => window.location.href = `/search?q=${encodeURIComponent(term)}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
