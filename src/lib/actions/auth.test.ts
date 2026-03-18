import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, logout } from './auth'
import { prismaMock } from '../__mocks__/prisma'

const mockCreateSession = vi.fn()
const mockDeleteSession = vi.fn()

vi.mock('@/lib/auth', () => ({
  createSession: (...args: any[]) => mockCreateSession(...args),
  deleteSession: () => mockDeleteSession(),
}))

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}))

const mockCompare = vi.fn()
vi.mock('bcryptjs', () => ({
  compare: (...args: any[]) => mockCompare(...args),
}))

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('returns error if email or password missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@test.com')

      const result = await login(undefined, formData) as any
      expect(result.error).toBe('Email and password are required')
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    })

    it('returns error if user not found', async () => {
      const formData = new FormData()
      formData.append('email', 'test@test.com')
      formData.append('password', 'password123')

      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await login(undefined, formData) as any
      expect(result.error).toBe('Invalid email or password')
    })

    it('returns error if password incorrect', async () => {
      const formData = new FormData()
      formData.append('email', 'test@test.com')
      formData.append('password', 'wrongpassword')

      prismaMock.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: 'hashedpassword' } as any)
      mockCompare.mockResolvedValue(false)

      const result = await login(undefined, formData) as any
      expect(result.error).toBe('Invalid email or password')
    })

    it('creates session and redirects on success', async () => {
      const formData = new FormData()
      formData.append('email', 'test@test.com')
      formData.append('password', 'correctpassword')

      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com', password: 'hashedpassword' } as any)
      mockCompare.mockResolvedValue(true)

      await login(undefined, formData)

      expect(mockCreateSession).toHaveBeenCalledWith('user-1', 'test@test.com')
      expect(mockRedirect).toHaveBeenCalledWith('/admin')
    })
  })

  describe('logout', () => {
    it('deletes session and redirects to login', async () => {
      await logout()
      expect(mockDeleteSession).toHaveBeenCalledTimes(1)
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })
})
