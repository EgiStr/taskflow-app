/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'

// Mock api-auth
const mockValidateApiKey = vi.fn()
vi.mock('@/lib/api-auth', () => ({
  validateApiKey: () => mockValidateApiKey(),
}))

// Mock n8n-webhook
const { mockFireWebhook, mockBuildTrackingUrl } = vi.hoisted(() => ({
  mockFireWebhook: vi.fn(),
  mockBuildTrackingUrl: vi.fn(),
}))
vi.mock('@/lib/n8n-webhook', () => ({
  fireWebhook: mockFireWebhook,
  buildTrackingUrl: mockBuildTrackingUrl,
}))

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}))

describe('PATCH /api/tasks/[id]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateApiKey.mockReturnValue(null) // Valid default
    mockBuildTrackingUrl.mockReturnValue('http://localhost/track?id=123')
  })

  it('should return 400 if invalid status is provided', async () => {
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'INVALID_STATUS' }),
    })

    const res = await PATCH(req, { params: Promise.resolve({ id: 'TF-123' }) }) as any
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 404 if task not found', async () => {
    prismaMock.task.findUnique.mockResolvedValue(null)
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })

    const res = await PATCH(req, { params: Promise.resolve({ id: 'TF-123' }) }) as any
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('should return 400 if status is already the same', async () => {
    prismaMock.task.findUnique.mockResolvedValue({ status: 'COMPLETED' } as any)
    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })

    const res = await PATCH(req, { params: Promise.resolve({ id: 'TF-123' }) }) as any
    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('tidak ada perubahan')
  })

  it('should update status, log audit, and fire webhook', async () => {
    prismaMock.task.findUnique.mockResolvedValue({
      id: 't-1',
      trackingId: 'TF-123',
      title: 'Task A',
      status: 'IN_PROGRESS',
      client: { name: 'Bob', telegramChatId: 'tg123' }
    } as any)

    const req = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })

    const res = await PATCH(req, { params: Promise.resolve({ id: 'TF-123' }) }) as any

    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: 't-1' },
      data: { status: 'COMPLETED' },
    })

    expect(prismaMock.auditLog.create).toHaveBeenCalled()
    expect(mockFireWebhook).toHaveBeenCalledWith('task.status_changed', expect.objectContaining({
      oldStatus: 'IN_PROGRESS',
      newStatus: 'COMPLETED',
    }))

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
