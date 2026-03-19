/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTask, updateTaskStatus, updateTask, deleteTask } from './tasks'
import { prismaMock } from '../__mocks__/prisma'

// Mock revalidatePath & webhook
const { mockRevalidatePath, mockFireWebhook, mockBuildTrackingUrl } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockFireWebhook: vi.fn(),
  mockBuildTrackingUrl: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/lib/n8n-webhook', () => ({
  fireWebhook: mockFireWebhook,
  buildTrackingUrl: mockBuildTrackingUrl,
}))

describe('Task Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTask', () => {
    it('should create task, audit log, and revalidate path', async () => {
      const formData = new FormData()
      formData.append('title', 'New Task')
      formData.append('description', 'Task desc')
      formData.append('priority', 'HIGH')
      formData.append('price', '500000')

      const mockTask = { id: 'task-1', trackingId: 'TF-1234', title: 'New Task' }
      prismaMock.task.create.mockResolvedValue(mockTask as any)

      const result = await createTask(formData)

      expect(prismaMock.task.create).toHaveBeenCalledTimes(1)
      expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1)
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'TASK_CREATED',
          details: JSON.stringify({ title: 'New Task', status: 'DRAFT' }),
          taskId: 'task-1',
        }
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/tasks')
      expect(result.success).toBe(true)
      expect(result.task).toEqual(mockTask)
    })
  })

  describe('updateTaskStatus', () => {
    it('should return error if task not found', async () => {
      prismaMock.task.findUnique.mockResolvedValue(null)
      const result = await updateTaskStatus('task-1', 'COMPLETED')
      expect(result.error).toBe('Task not found')
    })

    it('should update status, create audit log, fire webhook, and revalidate', async () => {
      const mockTask = {
        id: 'task-1',
        trackingId: 'TF-123',
        title: 'Task Title',
        status: 'IN_PROGRESS',
        client: { name: 'Client 1', telegramChatId: '123' }
      }
      prismaMock.task.findUnique.mockResolvedValue(mockTask as any)
      
      mockBuildTrackingUrl.mockReturnValue('http://localhost/track?id=TF-123')

      const result = await updateTaskStatus('task-1', 'COMPLETED')

      expect(prismaMock.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { status: 'COMPLETED' },
      })

      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'STATUS_CHANGE',
          details: JSON.stringify({ from: 'IN_PROGRESS', to: 'COMPLETED' }),
          taskId: 'task-1',
        }
      })

      expect(mockFireWebhook).toHaveBeenCalledWith('task.status_changed', expect.objectContaining({
        taskId: 'task-1',
        trackingId: 'TF-123',
        oldStatus: 'IN_PROGRESS',
        newStatus: 'COMPLETED',
        trackingUrl: 'http://localhost/track?id=TF-123',
      }))

      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/tasks')
      expect(result.success).toBe(true)
    })
  })

  describe('deleteTask', () => {
    it('should delete task and revalidate path', async () => {
      await deleteTask('task-1')

      expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/tasks')
    })
  })
})
