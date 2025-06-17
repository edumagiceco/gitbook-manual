'use client'

import { useState, useEffect } from 'react'
import { FileText, Hash, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'

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

interface SearchResultsProps {
  query: string
  results: SearchResult[]
  isLoading: boolean
  totalResults?: number
  searchTime?: number
}

export default function SearchResults({ 
  query, 
  results, 
  isLoading, 
  totalResults,
  searchTime 
}: SearchResultsProps) {
  const [highlightedResults, setHighlightedResults] = useState<SearchResult[]>([])

  // Highlight search terms in results
  useEffect(() => {
    if (!query.trim()) {
      setHighlightedResults(results)
      return
    }

    const highlighted = results.map(result => {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)
      
      const highlightText = (text: string) => {
        let highlightedText = text
        searchTerms.forEach(term => {
          const regex = new RegExp(`(${term})`, 'gi')
          highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>')
        })
        return highlightedText
      }

      return {
        ...result,
        title: highlightText(result.title),
        content: highlightText(result.content),
        excerpt: result.excerpt ? highlightText(result.excerpt) : undefined
      }
    })

    setHighlightedResults(highlighted)
  }, [query, results])

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'page':
        return <FileText className="w-5 h-5" />
      case 'heading':
        return <Hash className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'page':
        return 'Page'
      case 'heading':
        return 'Section'
      default:
        return 'Content'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading Skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Search Documentation
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Enter your search terms above to find relevant pages, sections, and content in the documentation.
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No results found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn&apos;t find any content matching <strong>&quot;{query}&quot;</strong>. 
          Try adjusting your search terms or check your spelling.
        </p>
        
        {/* Search suggestions */}
        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['getting started', 'configuration', 'API', 'examples'].map(suggestion => (
              <span 
                key={suggestion}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Meta Info */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          Found <strong>{totalResults || results.length}</strong> results for <strong>&quot;{query}&quot;</strong>
          {searchTime && (
            <span className="ml-2">({searchTime}ms)</span>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {highlightedResults.map((result) => (
          <article 
            key={result.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <Link href={result.path} className="block p-6 group">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors">
                  {getResultIcon(result.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title & Type */}
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 
                      className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      dangerouslySetInnerHTML={{ __html: result.title }}
                    />
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      {getTypeLabel(result.type)}
                    </span>
                    {result.matchCount && result.matchCount > 1 && (
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                        {result.matchCount} matches
                      </span>
                    )}
                  </div>

                  {/* Content/Excerpt */}
                  <p 
                    className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: result.excerpt || result.content 
                    }}
                  />

                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>{result.path}</span>
                    </span>
                    {result.lastModified && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated {result.lastModified}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Load More */}
      {totalResults && totalResults > results.length && (
        <div className="text-center pt-6">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Load More Results
          </button>
        </div>
      )}
    </div>
  )
}
