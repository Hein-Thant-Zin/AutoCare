import { Prisma } from '@prisma/client'

/**
 * Converts Prisma Decimal → number and Date/ISO-timestamp date fields
 * → plain "YYYY-MM-DD" strings so the client never sees:
 *   - "28000.00" (Decimal string) instead of 28000
 *   - "2026-08-19T00:00:00.000Z" (UTC midnight) shifting to wrong local date
 *
 * Date fields we normalize (by field name):
 *   date, nextServiceDate, purchaseDate
 */

const DATE_FIELDS = new Set(['date', 'nextServiceDate', 'purchaseDate'])

function toDateStr(val: unknown): string {
  if (val === null || val === undefined || val === '') return ''
  const d = new Date(val as string)
  if (isNaN(d.getTime())) return ''
  // Use UTC components to avoid timezone shifting
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function serializeDecimals<T>(value: T): T {
  if (value instanceof Prisma.Decimal) return Number(value) as unknown as T

  if (Array.isArray(value)) {
    return value.map((v) => serializeDecimals(v)) as unknown as T
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      if (DATE_FIELDS.has(k) && v !== null && v !== undefined) {
        const str = toDateStr(v)
        out[k] = str || null
      } else {
        out[k] = serializeDecimals(v)
      }
    }
    return out as T
  }

  return value
}
