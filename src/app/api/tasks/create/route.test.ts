/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { NextResponse } from 'next/server'

// Mock api-auth
const mockValidateApiKey = vi.fn()
vi.mock('@/lib/api-auth', () => ({
  validateApiKey: (req: Request) => mockValidateApiKey(req),
}))

// Mock webhook
const mockFireWebhook = vi.fn()
const mockBuildTrackingUrl = vi.fn()
vi.mock('@/lib/n8n-webhook', () => ({
  fireWebhook: (...args: any[]) => mockFireWebhook(...args),
  buildTrackingUrl: (id: string) => mockBuildTrackingUrl(id),
}))

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}))

describe('POST /api/tasks/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateApiKey.mockReturnValue(null) // Valid default
    mockBuildTrackingUrl.mockReturnValue('http://localhost/track?id=TF-123')
  })

  it('should return auth error if validateApiKey fails', async () => {
    mockValidateApiKey.mockReturnValue({ body: { error: 'AUTH' }, status: 401 } as any)
    
    const req = new Request('http://localhost/api/tasks/create', { method: 'POST', body: JSON.stringify({}) })
    const res = await POST(req) as any
    
    expect(res.status).toBe(401)
  })

  it('should return 400 if clientName or title is missing', async () => {
    const req = new Request('http://localhost/api/tasks/create', {
      method: 'POST',
      body: JSON.stringify({ clientName: 'John' }), // Missing title
    })
    
    const res = await POST(req) as any
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('should create new client and new task', async () => {
    const req = new Request('http://localhost/api/tasks/create', {
      method: 'POST',
      body: JSON.stringify({
        clientName: 'New Boss',
        title: 'Build me a house',
        price: 1500,
      }),
    })

    prismaMock.client.findFirst.mockResolvedValue(null)
    prismaMock.client.create.mockResolvedValue({ id: 'c-1', name: 'New Boss' } as any)
    
    prismaMock.task.create.mockResolvedValue({
      id: 't-1',
      trackingId: 'TF-000',
      title: 'Build me a house',
      createdAt: new Date(),
    } as any)

    const res = await POST(req) as any

    expect(prismaMock.client.create).toHaveBeenCalled()
    expect(prismaMock.task.create).toHaveBeenCalled()
    expect(prismaMock.auditLog.create).toHaveBeenCalled()
    expect(mockFireWebhook).toHaveBeenCalledWith('task.created', expect.any(Object))
    
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.client.isNew).toBe(true)
  })

  it('should reuse existing client and update details if provided', async () => {
    const req = new Request('http://localhost/api/tasks/create', {
      method: 'POST',
      body: JSON.stringify({
        clientName: 'Old Boss',
        title: 'Fix the roof',
        clientPhone: '08123',
      }),
    })

    prismaMock.client.findFirst.mockResolvedValue({ id: 'c-2', name: 'Old Boss', phone: null } as any)
    prismaMock.client.update.mockResolvedValue({ id: 'c-2', name: 'Old Boss', phone: '08123' } as any)
    
    prismaMock.task.create.mockResolvedValue({
      id: 't-2',
      trackingId: 'TF-111',
      title: 'Fix the roof',
      createdAt: new Date(),
    } as any)

    const res = await POST(req) as any

    expect(prismaMock.client.create).not.toHaveBeenCalled()
    expect(prismaMock.client.update).toHaveBeenCalled()
    expect(res.status).toBe(201)
    expect(res.body.data.client.isNew).toBe(false)
  })
})
