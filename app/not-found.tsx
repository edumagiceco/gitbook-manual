'use client'

import Link from 'next/link'
import { Home, Search, FileText, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const suggestions = [
    { title: 'Getting Started', path: '/docs/getting-started', icon: FileText },
    { title: 'API Reference', path: '/docs/api', icon: FileText },
    { title: 'Examples', path: '/docs/examples', icon: FileText },
    { title: 'Configuration', path: '/docs/config', icon: FileText }
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">
            404
          </div>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
          
          <Link
            href="/search"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Documentation
          </Link>
        </div>

        {/* Helpful Suggestions */}
        <div className="text-left">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Popular Pages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                    {item.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-4">
            Still can&apos;t find what you&apos;re looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go Back
            </button>
            <Link
              href="/contact"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact Support
            </Link>
            <Link
              href="/sitemap"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Sitemap
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
