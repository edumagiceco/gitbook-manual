import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface SearchResult {
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

// Get content directory from environment variable
const getContentDir = () => {
  const contentDir = process.env.CONTENT_DIR || 'content';
  return path.join(process.cwd(), contentDir);
};

// Simple text search implementation
function searchInText(text: string, query: string): { matches: number; excerpt?: string } {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const words = lowerQuery.split(' ').filter(word => word.length > 0)
  
  let matches = 0
  let excerpt = ''
  
  words.forEach(word => {
    const regex = new RegExp(word, 'gi')
    const wordMatches = (text.match(regex) || []).length
    matches += wordMatches
  })
  
  // Generate excerpt with context around first match
  const firstMatch = lowerText.indexOf(lowerQuery)
  if (firstMatch !== -1) {
    const start = Math.max(0, firstMatch - 50)
    const end = Math.min(text.length, firstMatch + lowerQuery.length + 50)
    excerpt = text.substring(start, end)
    if (start > 0) excerpt = '...' + excerpt
    if (end < text.length) excerpt = excerpt + '...'
  }
  
  return { matches, excerpt }
}

// Get all markdown files from content directory
function getAllDocuments(): SearchResult[] {
  const contentDirectory = getContentDir()
  const results: SearchResult[] = []
  
  try {
    if (!fs.existsSync(contentDirectory)) {
      console.warn(`Content directory not found: ${contentDirectory}`)
      return []
    }
    
    function processDirectory(dir: string, basePath: string = '') {
      try {
        const files = fs.readdirSync(dir)
        
        files.forEach(file => {
          const filePath = path.join(dir, file)
          
          try {
            const stat = fs.statSync(filePath)
            
            if (stat.isDirectory()) {
              processDirectory(filePath, `${basePath}/${file}`)
            } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
              const content = fs.readFileSync(filePath, 'utf8')
              const { data: frontMatter, content: markdownContent } = matter(content)
              
              const relativePath = `${basePath}/${file.replace(/\.(md|mdx)$/, '')}`
              const urlPath = relativePath.replace(/^\//, '/')
              
              results.push({
                id: relativePath,
                title: frontMatter.title || file.replace(/\.(md|mdx)$/, ''),
                content: markdownContent,
                path: urlPath,
                type: 'page',
                lastModified: stat.mtime.toISOString().split('T')[0]
              })
            }
          } catch (fileError) {
            console.error(`Error processing file ${filePath}:`, fileError)
          }
        })
      } catch (dirError) {
        console.error(`Error reading directory ${dir}:`, dirError)
      }
    }
    
    processDirectory(contentDirectory)
  } catch (error) {
    console.error('Error reading content directory:', error)
  }
  
  return results
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
        query: '',
        searchTime: 0,
        contentDir: process.env.CONTENT_DIR || 'content'
      })
    }
    
    const startTime = Date.now()
    
    // Get all documents
    const allDocuments = getAllDocuments()
    
    // Search through documents
    const searchResults: SearchResult[] = []
    
    allDocuments.forEach(doc => {
      const titleMatch = searchInText(doc.title, query)
      const contentMatch = searchInText(doc.content, query)
      
      const totalMatches = titleMatch.matches + contentMatch.matches
      
      if (totalMatches > 0) {
        // Calculate search score (title matches weighted higher)
        const score = (titleMatch.matches * 3) + contentMatch.matches
        
        const result: SearchResult = {
          ...doc,
          matchCount: totalMatches,
          score,
          excerpt: titleMatch.excerpt || contentMatch.excerpt || doc.content.substring(0, 150) + '...'
        }
        
        searchResults.push(result)
      }
    })
    
    // Sort by score (relevance)
    searchResults.sort((a, b) => (b.score || 0) - (a.score || 0))
    
    // Apply pagination
    const paginatedResults = searchResults.slice(offset, offset + limit)
    
    const searchTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      results: paginatedResults,
      total: searchResults.length,
      query,
      searchTime,
      limit,
      offset,
      contentDir: process.env.CONTENT_DIR || 'content'
    })
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Support POST for complex search queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters, limit = 10, offset = 0 } = body
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
        query: '',
        searchTime: 0,
        contentDir: process.env.CONTENT_DIR || 'content'
      })
    }
    
    const startTime = Date.now()
    
    // Get all documents
    const allDocuments = getAllDocuments()
    
    // Apply filters if provided
    let filteredDocuments = allDocuments
    if (filters?.type) {
      filteredDocuments = allDocuments.filter(doc => doc.type === filters.type)
    }
    
    // Search through filtered documents
    const searchResults: SearchResult[] = []
    
    filteredDocuments.forEach(doc => {
      const titleMatch = searchInText(doc.title, query)
      const contentMatch = searchInText(doc.content, query)
      
      const totalMatches = titleMatch.matches + contentMatch.matches
      
      if (totalMatches > 0) {
        const score = (titleMatch.matches * 3) + contentMatch.matches
        
        const result: SearchResult = {
          ...doc,
          matchCount: totalMatches,
          score,
          excerpt: titleMatch.excerpt || contentMatch.excerpt || doc.content.substring(0, 150) + '...'
        }
        
        searchResults.push(result)
      }
    })
    
    // Sort by score
    searchResults.sort((a, b) => (b.score || 0) - (a.score || 0))
    
    // Apply pagination
    const paginatedResults = searchResults.slice(offset, offset + limit)
    
    const searchTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      results: paginatedResults,
      total: searchResults.length,
      query,
      searchTime,
      limit,
      offset,
      filters,
      contentDir: process.env.CONTENT_DIR || 'content'
    })
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
