import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { NextResponse } from 'next/server'

// Mock next/headers
vi.mock('next/headers', () => ({ cookies: vi.fn() }))

const mockGetSession = vi.fn()
vi.mock('@/lib/auth', () => ({
  getSession: () => mockGetSession(),
}))

// Mock fs
const { mockReadFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn()
}))

vi.mock('fs/promises', () => ({
  __esModule: true,
  readFile: mockReadFile,
  default: {
    readFile: mockReadFile,
  }
}))

// Mock NextResponse
vi.mock('next/server', () => {
  const MockNextResponse = class {
    headers = new Map()
    body: any
    constructor(body: any) { this.body = body }
  } as any
  MockNextResponse.json = vi.fn((body, init) => ({ body, status: init?.status ?? 200 }))
  return { NextResponse: MockNextResponse }
})

describe('GET /api/download/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ userId: 'admin' })
  })

  it('should return 404 if file not found anywhere', async () => {
    prismaMock.taskFile.findUnique.mockResolvedValue(null)
    prismaMock.paymentProof.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost')
    const res = await GET(req, { params: Promise.resolve({ id: 'f-1' }) }) as any

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('File not found')
  })

  it('should return 401 if accessing payment proof without auth', async () => {
    mockGetSession.mockResolvedValue(null)

    prismaMock.taskFile.findUnique.mockResolvedValue(null)
    prismaMock.paymentProof.findUnique.mockResolvedValue({
      id: 'p-1', filepath: '/uploads/proof.jpg', filename: 'proof.jpg'
    } as any)

    const req = new Request('http://localhost')
    const res = await GET(req, { params: Promise.resolve({ id: 'p-1' }) }) as any

    expect(res.status).toBe(401)
  })

  it('should return file buffer with correct headers for deliverable', async () => {
    prismaMock.taskFile.findUnique.mockResolvedValue({
      id: 'f-1', filepath: '/uploads/doc.pdf', filename: 'doc.pdf'
    } as any)

    mockReadFile.mockResolvedValue(Buffer.from('filedata'))

    const req = new Request('http://localhost')
    const res = await GET(req, { params: Promise.resolve({ id: 'f-1' }) }) as any

    expect(mockReadFile).toHaveBeenCalled()
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="doc.pdf"')
    expect(res.headers.get('Content-Type')).toBe('application/octet-stream')
    expect(res.body).toEqual(Buffer.from('filedata'))
  })
})
