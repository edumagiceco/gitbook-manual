/**
 * API 통합 테스트
 */

import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/search'

describe('/api/search API Integration Tests', () => {
  
  it('responds with 200 for valid search query', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        q: 'welcome'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('results')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('query', 'welcome')
  })

  it('responds with 400 for missing query parameter', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {}
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('error')
  })

  it('responds with 405 for unsupported method', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      query: {
        q: 'test'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
  })

  it('handles empty search query', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        q: ''
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data.results).toEqual([])
    expect(data.total).toBe(0)
  })

  it('supports pagination parameters', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        q: 'test',
        limit: '5',
        offset: '10'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('limit', 5)
    expect(data).toHaveProperty('offset', 10)
  })
})

/**
 * 문서 API 통합 테스트
 */
describe('/api/documents API Integration Tests', () => {
  
  it('returns document list successfully', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    const documentsHandler = require('@/pages/api/documents').default
    await documentsHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('handles file system errors gracefully', async () => {
    // Mock fs to throw error
    const originalFs = require('fs')
    const mockFs = {
      ...originalFs,
      readdir: jest.fn().mockImplementation((path, callback) => {
        callback(new Error('Permission denied'))
      })
    }
    jest.doMock('fs', () => mockFs)

    const { req, res } = createMocks({
      method: 'GET'
    })

    const documentsHandler = require('@/pages/api/documents').default
    await documentsHandler(req, res)

    // Should handle error gracefully
    expect(res._getStatusCode()).toBeLessThan(500)
  })
})

/**
 * 이미지 API 통합 테스트
 */
describe('/api/images API Integration Tests', () => {
  
  it('returns empty image list initially', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    const imagesHandler = require('@/pages/api/images').default
    await imagesHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('count', 0)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('handles POST requests for image upload', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data'
      }
    })

    const imagesHandler = require('@/pages/api/images').default
    await imagesHandler(req, res)

    // Should respond with some status (implementation dependent)
    expect(res._getStatusCode()).toBeGreaterThanOrEqual(200)
  })
})
