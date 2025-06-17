/**
 * 검색 기능 유닛 테스트
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchModal } from '@/components/search/SearchModal'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('SearchModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    mockFetch.mockClear()
    mockOnClose.mockClear()
    mockOnSelect.mockClear()
  })

  it('renders search modal correctly', () => {
    render(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    )

    expect(screen.getByPlaceholderText(/search documentation/i)).toBeInTheDocument()
    expect(screen.getByText(/start typing to search/i)).toBeInTheDocument()
  })

  it('handles search input correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    )

    const searchInput = screen.getByPlaceholderText(/search documentation/i)
    await user.type(searchInput, 'welcome')

    expect(searchInput).toHaveValue('welcome')
  })

  it('calls onClose when escape is pressed', async () => {
    const user = userEvent.setup()
    
    render(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    )

    await user.keyboard('{Escape}')
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('displays search results correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: '1',
            title: 'Welcome Guide',
            content: 'Welcome to our documentation',
            path: '/docs/welcome'
          }
        ],
        total: 1
      })
    })

    const user = userEvent.setup()
    
    render(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    )

    const searchInput = screen.getByPlaceholderText(/search documentation/i)
    await user.type(searchInput, 'welcome')

    await waitFor(() => {
      expect(screen.getByText(/welcome guide/i)).toBeInTheDocument()
    })
  })

  it('handles no search results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        total: 0
      })
    })

    const user = userEvent.setup()
    
    render(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSelect={mockOnSelect} 
      />
    )

    const searchInput = screen.getByPlaceholderText(/search documentation/i)
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument()
    })
  })
})
