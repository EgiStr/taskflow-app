import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient, updateClient, deleteClient } from './clients'
import { prismaMock } from '../__mocks__/prisma'

// Mock revalidatePath
const { mockRevalidatePath } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn()
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

describe('Client Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createClient', () => {
    it('should return error if name is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')

      const result = await createClient(formData)
      
      expect(result.error).toBe('Name is required')
      expect(prismaMock.client.create).not.toHaveBeenCalled()
    })

    it('should create client and revalidate path', async () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@doe.com')
      formData.append('phone', '12345678')
      formData.append('company', 'Doe Inc')
      formData.append('notes', 'VIP client')

      const mockClientData = { id: 'client-1', name: 'John Doe', email: 'john@doe.com', phone: '12345678', company: 'Doe Inc', notes: 'VIP client' }
      prismaMock.client.create.mockResolvedValue(mockClientData as any)

      const result = await createClient(formData)

      expect(prismaMock.client.create).toHaveBeenCalledTimes(1)
      expect(prismaMock.client.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@doe.com',
          phone: '12345678',
          company: 'Doe Inc',
          notes: 'VIP client',
        }
      })
      expect(result.success).toBe(true)
      expect(result.client).toEqual(mockClientData)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/clients')
    })
  })

  describe('updateClient', () => {
    it('should update client and revalidate paths', async () => {
      const formData = new FormData()
      formData.append('name', 'Jane Doe')
      
      prismaMock.client.update.mockResolvedValue({ id: 'client-1', name: 'Jane Doe' } as any)

      const result = await updateClient('client-1', formData)

      expect(prismaMock.client.update).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/clients')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/clients/client-1')
    })
  })

  describe('deleteClient', () => {
    it('should delete client and revalidate path', async () => {
      prismaMock.client.delete.mockResolvedValue({ id: 'client-1' } as any)

      const result = await deleteClient('client-1')

      expect(prismaMock.client.delete).toHaveBeenCalledTimes(1)
      expect(prismaMock.client.delete).toHaveBeenCalledWith({ where: { id: 'client-1' } })
      expect(result.success).toBe(true)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/clients')
    })
  })
})
