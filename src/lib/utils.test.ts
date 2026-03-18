import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (Tailwind Class Merger)', () => {
  it('should merge basic strings', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isError = false
    expect(cn('base-class', isActive && 'active-class', isError && 'error-class')).toBe('base-class active-class')
  })

  it('should merge conflicting tailwind classes correctly', () => {
    // tailwind-merge should resolve padding conflicts
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
  })
})
