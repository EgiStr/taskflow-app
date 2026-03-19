/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'

// Mock next/headers for auth
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

const mockGetSession = vi.fn()
vi.mock('@/lib/auth', () => ({
  getSession: () => mockGetSession(),
}))

// Mock fs and uuid
const { mockWriteFile, mockMkdir } = vi.hoisted(() => ({
  mockWriteFile: vi.fn(),
  mockMkdir: vi.fn(),
}))

vi.mock('fs/promises', () => ({
  __esModule: true,
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
  default: {
    writeFile: mockWriteFile,
    mkdir: mockMkdir,
  }
}))

vi.mock('uuid', () => ({
  v4: () => '1234-uuid',
}))

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}))

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ userId: 'admin' }) // Default authed
  })

  it('should return 400 if missing fields', async () => {
    const formData = new FormData()
    // Missing file, taskId, type
    const req = new Request('http://localhost', { method: 'POST', body: formData })
    req.formData = async () => formData

    const res = await POST(req) as any
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Missing required fields')
  })

  it('should return 404 if task not found', async () => {
    const formData = new FormData()
    formData.append('file', new File(['content'], 'test.png', { type: 'image/png' }))
    formData.append('taskId', 'task-1')
    formData.append('type', 'DELIVERABLE')

    const req = new Request('http://localhost', { method: 'POST' })
    req.formData = async () => formData

    prismaMock.task.findUnique.mockResolvedValue(null)

    const res = await POST(req) as any
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Task not found')
  })

  it('should return 401 if unauthorized for DELIVERABLE', async () => {
    mockGetSession.mockResolvedValue(null) // Unauthenticated

    const formData = new FormData()
    formData.append('file', new File(['content'], 'test.png'))
    formData.append('taskId', 'task-1')
    formData.append('type', 'DELIVERABLE')

    const req = new Request('http://localhost', { method: 'POST' })
    req.formData = async () => formData

    prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1' } as any)

    const res = await POST(req) as any
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Unauthorized')
  })

  it('should upload deliverable successfully', async () => {
    const formData = new FormData()
    formData.append('file', new File(['filecontent'], 'doc.pdf'))
    formData.append('taskId', 'task-1')
    formData.append('type', 'DELIVERABLE')

    const req = new Request('http://localhost', { method: 'POST' })
    req.formData = async () => formData

    prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1' } as any)

    const res = await POST(req) as any

    expect(mockWriteFile).toHaveBeenCalled()
    expect(prismaMock.taskFile.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ filename: 'doc.pdf', taskId: 'task-1' })
    }))
    expect(prismaMock.auditLog.create).toHaveBeenCalled()
    
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.filepath).toBe('/uploads/1234-uuid-doc.pdf')
  })
})
