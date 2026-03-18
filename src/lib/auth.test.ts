/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { encrypt, decrypt, createSession, getSession, deleteSession } from './auth'

// Mock next/headers
const mockSet = vi.fn()
const mockGet = vi.fn()
const mockDelete = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: mockSet,
    get: mockGet,
    delete: mockDelete,
  })),
}))

vi.mock('server-only', () => ({}))

describe('auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('JWT encryption and decryption', () => {
    it('should encrypt and decrypt a payload correctly', async () => {
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 10000),
      }

      const token = await encrypt(payload)
      expect(typeof token).toBe('string')

      const decrypted = await decrypt(token)
      expect(decrypted).not.toBeNull()
      expect(decrypted?.userId).toBe('user-1')
      expect(decrypted?.email).toBe('test@example.com')
    })

    it('should return null when decrypting an invalid token', async () => {
      const decrypted = await decrypt('invalid.token.here')
      expect(decrypted).toBeNull()
    })
  })

  describe('Session handlers', () => {
    it('createSession should encrypt data and set a cookie', async () => {
      await createSession('user-1', 'test@example.com')

      expect(mockSet).toHaveBeenCalledTimes(1)
      expect(mockSet).toHaveBeenCalledWith('session', expect.any(String), expect.objectContaining({
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
      }))
    })

    it('getSession should return payload if cookie exists and valid', async () => {
      const expiresAt = new Date(Date.now() + 10000)
      const token = await encrypt({ userId: 'user-1', email: 'test@example.com', expiresAt })
      
      mockGet.mockReturnValue({ value: token })

      const session = await getSession()
      expect(session).not.toBeNull()
      expect(session?.userId).toBe('user-1')
    })

    it('getSession should return null if cookie is missing', async () => {
      mockGet.mockReturnValue(undefined)

      const session = await getSession()
      expect(session).toBeNull()
    })

    it('deleteSession should command cookie store to delete session', async () => {
      await deleteSession()
      expect(mockDelete).toHaveBeenCalledTimes(1)
      expect(mockDelete).toHaveBeenCalledWith('session')
    })
  })
})
