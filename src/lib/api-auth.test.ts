import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateApiKey } from './api-auth'
import { NextResponse } from 'next/server'

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}))

describe('validateApiKey', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  it('should return 500 if N8N_API_KEY is not set', () => {
    delete process.env.N8N_API_KEY
    const req = new Request('http://localhost', { headers: { 'x-api-key': 'some-key' } })
    
    const result = validateApiKey(req) as any
    expect(result.status).toBe(500)
    expect(result.body.error.code).toBe('INTERNAL_ERROR')
  })

  it('should return 401 if API key is missing from headers', () => {
    process.env.N8N_API_KEY = 'secret-key'
    const req = new Request('http://localhost')
    
    const result = validateApiKey(req) as any
    expect(result.status).toBe(401)
    expect(result.body.error.code).toBe('UNAUTHORIZED')
  })

  it('should return 401 if API key is incorrect', () => {
    process.env.N8N_API_KEY = 'secret-key'
    const req = new Request('http://localhost', { headers: { 'x-api-key': 'wrong-key' } })
    
    const result = validateApiKey(req) as any
    expect(result.status).toBe(401)
    expect(result.body.error.code).toBe('UNAUTHORIZED')
  })

  it('should return null if API key is correct', () => {
    process.env.N8N_API_KEY = 'secret-key'
    const req = new Request('http://localhost', { headers: { 'x-api-key': 'secret-key' } })
    
    const result = validateApiKey(req)
    expect(result).toBeNull()
  })
})
