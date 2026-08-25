import { describe, it, expect } from 'vitest'
import { Prisma } from '@prisma/client'
import { serializeDecimals } from '@/lib/serialize'

describe('serializeDecimals', () => {
  it('converts Prisma Decimal values to numbers', () => {
    expect(serializeDecimals(new Prisma.Decimal('51000.00'))).toBe(51_000)
  })

  it('walks nested objects and arrays', () => {
    const input = {
      id: 'r1',
      totalCost: new Prisma.Decimal('1200.50'),
      items: [{ partsCost: new Prisma.Decimal('800'), label: 'oil' }],
    }
    expect(serializeDecimals(input)).toEqual({
      id: 'r1',
      totalCost: 1200.5,
      items: [{ partsCost: 800, label: 'oil' }],
    })
  })

  it('leaves primitives and null untouched', () => {
    expect(serializeDecimals(null)).toBeNull()
    expect(serializeDecimals(42)).toBe(42)
    expect(serializeDecimals('x')).toBe('x')
  })
})
