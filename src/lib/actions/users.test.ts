/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllUsers } from './users'
import { prismaMock } from '../__mocks__/prisma'

describe('User Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAllUsers should return a list of users successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'Admin 1', email: 'admin1@admin.com' },
      { id: '2', name: 'Admin 2', email: 'admin2@admin.com' },
    ]
    prismaMock.user.findMany.mockResolvedValue(mockUsers as any)

    const result = await getAllUsers()
    
    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })
    expect(result.users).toEqual(mockUsers)
    expect(result.error).toBeUndefined()
  })

  it('getAllUsers should return an error if DB fails', async () => {
    const error = new Error('Database disconnected')
    prismaMock.user.findMany.mockRejectedValue(error)

    const result = await getAllUsers()
    
    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1)
    expect(result.error).toBe('Gagal mengambil data admin.')
    expect(result.users).toBeUndefined()
  })
})
