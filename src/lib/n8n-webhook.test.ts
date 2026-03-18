import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireWebhook, buildTrackingUrl } from './n8n-webhook'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('n8n-webhook', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  describe('fireWebhook', () => {
    it('should not call fetch if N8N_WEBHOOK_URL is not set', () => {
      delete process.env.N8N_WEBHOOK_URL
      fireWebhook('task.created', { id: '123' })
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should call fetch with correct payload if URL is set', () => {
      process.env.N8N_WEBHOOK_URL = 'http://n8n.example.com/webhook'
      mockFetch.mockResolvedValueOnce({ ok: true })

      fireWebhook('task.status_changed', { taskId: 'T-100', status: 'COMPLETED' })
      
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith('http://n8n.example.com/webhook', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }))

      const fetchArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(fetchArgs.body)
      expect(body.event).toBe('task.status_changed')
      expect(body.data.taskId).toBe('T-100')
      expect(body.timestamp).toBeDefined()
    })

    it('should not throw if fetch fails (fire and forget)', () => {
      process.env.N8N_WEBHOOK_URL = 'http://n8n.example.com/webhook'
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      // Should bypass safely
      expect(() => fireWebhook('task.created', {})).not.toThrow()
    })
  })

  describe('buildTrackingUrl', () => {
    it('should build url using NEXT_PUBLIC_APP_URL', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com'
      const url = buildTrackingUrl('TSK-123')
      expect(url).toBe('https://myapp.com/track?id=TSK-123')
    })

    it('should fallback to localhost if NEXT_PUBLIC_APP_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      const url = buildTrackingUrl('TSK-abc')
      expect(url).toBe('http://localhost:3000/track?id=TSK-abc')
    })
  })
})
