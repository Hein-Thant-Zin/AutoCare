import { Prisma } from '@prisma/client'

/**
 * Converts Prisma Decimal instances to plain numbers so API JSON
 * responses contain numbers (Decimal.toJSON() would emit strings).
 */
export function serializeDecimals<T>(value: T): T {
  if (value instanceof Prisma.Decimal) return Number(value) as unknown as T
  if (Array.isArray(value)) {
    return value.map((v) => serializeDecimals(v)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = serializeDecimals(v)
    return out as T
  }
  return value
}
