/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'

// Mock api-auth
const mockValidateApiKey = vi.fn()
vi.mock('@/lib/api-auth', () => ({
  validateApiKey: () => mockValidateApiKey(),
}))

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}))

describe('GET /api/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateApiKey.mockReturnValue(null) // Valid default
  })

  it('should return 404 if task not found', async () => {
    prismaMock.task.findUnique.mockResolvedValue(null)
    
    const req = new Request('http://localhost')
    const res = await GET(req, { params: Promise.resolve({ id: 'TF-999' }) }) as any
    
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('should return task detail if found via trackingId', async () => {
    const mockTask = {
      id: 't-1',
      trackingId: 'TF-1234',
      title: 'Website',
      createdAt: new Date(),
      updatedAt: new Date(),
      auditLogs: [],
      files: [],
      client: { id: 'c-1', name: 'Bill' }
    }
    prismaMock.task.findUnique.mockResolvedValue(mockTask as any)
    
    const req = new Request('http://localhost')
    const res = await GET(req, { params: Promise.resolve({ id: 'TF-1234' }) }) as any
    
    expect(prismaMock.task.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { trackingId: 'TF-1234' }
    }))
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Website')
  })

  it('should return task detail if found via CUID', async () => {
    const mockTask = {
      id: 'cuid-123',
      trackingId: 'TF-5555',
      title: 'App',
      createdAt: new Date(),
      updatedAt: new Date(),
      auditLogs: [],
      files: [],
    }
    prismaMock.task.findUnique.mockResolvedValue(mockTask as any)
    
    const req = new Request('http://localhost')
    const res = await GET(req, { params: Promise.resolve({ id: 'cuid-123' }) }) as any
    
    expect(prismaMock.task.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'cuid-123' }
    }))
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('App')
  })
})
