// Search Components
export { default as SearchBar } from './SearchBar'
export { default as SearchModal } from './SearchModal'
export { default as SearchResults } from './SearchResults'
export { useSearchShortcut, GlobalSearchProvider } from './useSearchShortcut'

// Navigation Components  
export { default as PageNavigation } from '../navigation/PageNavigation'
export { default as Breadcrumb, generateBreadcrumbsFromPath } from '../navigation/Breadcrumb'

// Types
export interface SearchResult {
  id: string
  title: string
  content: string
  path: string
  type: 'page' | 'heading' | 'text'
  excerpt?: string
  lastModified?: string
  matchCount?: number
  score?: number
}

export interface PageInfo {
  title: string
  path: string
  description?: string
}

export interface BreadcrumbItem {
  title: string
  path?: string
  isActive?: boolean
}
