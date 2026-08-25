import { describe, it, expect } from 'vitest'
import {
  vehicleSchema,
  maintenanceSchema,
  maintenanceItemSchema,
} from '@/lib/validations'

// ─── Vehicle ──────────────────────────────────────────────────────────────────

describe('vehicleSchema', () => {
  const valid = {
    type: 'car',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'YGN-1234',
    currentMileage: 50_000,
  }

  it('accepts a valid vehicle', () => {
    expect(vehicleSchema.safeParse(valid).success).toBe(true)
  })

  it('coerces numeric strings from form inputs', () => {
    const parsed = vehicleSchema.parse({ ...valid, year: '2020', currentMileage: '50000' })
    expect(parsed.year).toBe(2020)
    expect(parsed.currentMileage).toBe(50_000)
  })

  it('rejects missing required fields', () => {
    const { brand, ...withoutBrand } = valid
    expect(vehicleSchema.safeParse(withoutBrand).success).toBe(false)
  })

  it('rejects out-of-range years', () => {
    expect(vehicleSchema.safeParse({ ...valid, year: 1899 }).success).toBe(false)
    expect(vehicleSchema.safeParse({ ...valid, year: new Date().getFullYear() + 2 }).success).toBe(false)
  })

  it('treats empty purchaseDate as unset instead of storing an empty string', () => {
    const parsed = vehicleSchema.parse({ ...valid, purchaseDate: '' })
    expect(parsed.purchaseDate).toBeUndefined()
  })

  it('keeps a real purchaseDate as a string (API converts to Date)', () => {
    const parsed = vehicleSchema.parse({ ...valid, purchaseDate: '2024-01-15' })
    expect(parsed.purchaseDate).toBe('2024-01-15')
  })
})

// ─── Maintenance item ─────────────────────────────────────────────────────────

describe('maintenanceItemSchema', () => {
  it('defaults costs to 0 when omitted', () => {
    const parsed = maintenanceItemSchema.parse({ type: 'engine_oil' })
    expect(parsed.partsCost).toBe(0)
    expect(parsed.laborCost).toBe(0)
  })

  it('rejects unknown types and negative costs', () => {
    expect(maintenanceItemSchema.safeParse({ type: 'oil_change' }).success).toBe(false)
    expect(
      maintenanceItemSchema.safeParse({ type: 'brake', partsCost: -1 }).success
    ).toBe(false)
  })
})

// ─── Maintenance record ───────────────────────────────────────────────────────

describe('maintenanceSchema', () => {
  const valid = {
    vehicleId: 'veh_1',
    date: '2026-08-19',
    mileage: 12_345,
  }

  it('keeps the date as a validated string (API converts to Date)', () => {
    const parsed = maintenanceSchema.parse(valid)
    expect(parsed.date).toBe('2026-08-19')
  })

  it('rejects a missing or empty date', () => {
    const { date, ...noDate } = valid
    expect(maintenanceSchema.safeParse(noDate).success).toBe(false)
    expect(maintenanceSchema.safeParse({ ...valid, date: '' }).success).toBe(false)
  })

  it('rejects an unparseable date', () => {
    expect(maintenanceSchema.safeParse({ ...valid, date: 'not-a-date' }).success).toBe(false)
  })

  it('defaults legacy cost fields to 0', () => {
    const parsed = maintenanceSchema.parse(valid)
    expect(parsed.partsCost).toBe(0)
    expect(parsed.laborCost).toBe(0)
    expect(parsed.totalCost).toBe(0)
  })

  it('treats empty next-service fields as unset (not zero)', () => {
    const parsed = maintenanceSchema.parse({
      ...valid,
      nextServiceDate: '',
      nextServiceMileage: '',
    })
    expect(parsed.nextServiceDate).toBeUndefined()
    expect(parsed.nextServiceMileage).toBeUndefined()
  })

  it('accepts multi-item records', () => {
    const parsed = maintenanceSchema.parse({
      ...valid,
      items: [
        { type: 'engine_oil', partsCost: 8000, laborCost: 2000 },
        { type: 'oil_filter', partsCost: 1500 },
      ],
    })
    expect(parsed.items).toHaveLength(2)
    expect(parsed.items?.[1].laborCost).toBe(0)
  })

  it('rejects an empty items array', () => {
    expect(maintenanceSchema.safeParse({ ...valid, items: [] }).success).toBe(false)
  })
})
