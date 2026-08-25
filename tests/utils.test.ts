import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatMileage,
  formatDate,
  daysBetween,
  todayISO,
  monthKey,
  getReminderStatus,
  groupCostsByMonth,
  currentMonthCost,
  vehicleName,
} from '@/lib/utils'
import type { MaintenanceRecord } from '@/types'

const dateOffsetISO = (days: number): string =>
  new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0]

const record = (over: Partial<MaintenanceRecord> = {}): MaintenanceRecord => ({
  id: 'r1',
  vehicleId: 'v1',
  date: todayISO(),
  mileage: 10_000,
  type: 'engine_oil',
  partsCost: 0,
  laborCost: 0,
  totalCost: 0,
  createdAt: todayISO(),
  updatedAt: todayISO(),
  ...over,
})

// ─── Formatting ───────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats whole amounts with currency suffix', () => {
    expect(formatCurrency(51000)).toBe('51,000 MMK')
  })

  it('rounds fractional amounts', () => {
    expect(formatCurrency(99.6, 'USD')).toBe('100 USD')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('0 MMK')
  })
})

describe('formatMileage', () => {
  it('formats with unit', () => {
    expect(formatMileage(12345)).toBe('12,345 km')
    expect(formatMileage(1000, 'mi')).toBe('1,000 mi')
  })
})

describe('formatDate', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2026-08-19')).toMatch(/19 Aug 2026/)
  })

  it('returns em-dash for empty or invalid input', () => {
    expect(formatDate('')).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
  })
})

describe('vehicleName', () => {
  it('joins brand, model and year', () => {
    expect(
      vehicleName({ brand: 'Honda', model: 'Wave', year: 2020 } as never)
    ).toBe('Honda Wave 2020')
  })
})

// ─── Date math ────────────────────────────────────────────────────────────────

describe('daysBetween', () => {
  it('computes positive and negative day differences', () => {
    expect(daysBetween('2026-08-19', '2026-08-29')).toBe(10)
    expect(daysBetween('2026-08-29', '2026-08-19')).toBe(-10)
    expect(daysBetween('2026-08-19', '2026-08-19')).toBe(0)
  })
})

describe('todayISO / monthKey', () => {
  it('todayISO returns YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('monthKey returns "Mon YYYY"', () => {
    expect(monthKey('2026-08-19')).toMatch(/Aug 2026/)
  })
})

// ─── Reminder status ──────────────────────────────────────────────────────────

describe('getReminderStatus', () => {
  it('returns ok when there is no record', () => {
    expect(getReminderStatus(undefined, 10_000)).toBe('ok')
  })

  it('returns ok when no service schedule is set', () => {
    expect(getReminderStatus(record(), 10_000)).toBe('ok')
  })

  it('returns overdue when next service date has passed', () => {
    expect(getReminderStatus(record({ nextServiceDate: dateOffsetISO(-1) }), 0)).toBe('overdue')
  })

  it('returns due_soon when next service is within 14 days', () => {
    expect(getReminderStatus(record({ nextServiceDate: dateOffsetISO(14) }), 0)).toBe('due_soon')
  })

  it('returns ok when next service is far away', () => {
    expect(getReminderStatus(record({ nextServiceDate: dateOffsetISO(15) }), 0)).toBe('ok')
  })

  it('returns overdue when next service mileage is reached', () => {
    expect(getReminderStatus(record({ nextServiceMileage: 10_000 }), 10_500)).toBe('overdue')
  })

  it('returns due_soon when within 500 km of next service mileage', () => {
    expect(getReminderStatus(record({ nextServiceMileage: 10_400 }), 10_000)).toBe('due_soon')
  })

  it('ignores nextServiceMileage of 0 (unset)', () => {
    expect(getReminderStatus(record({ nextServiceMileage: 0 }), 10_000)).toBe('ok')
  })

  it('overdue takes precedence over due_soon', () => {
    const r = record({ nextServiceDate: dateOffsetISO(5), nextServiceMileage: 10_000 })
    expect(getReminderStatus(r, 20_000)).toBe('overdue')
  })
})

// ─── Cost grouping ────────────────────────────────────────────────────────────

describe('groupCostsByMonth', () => {
  it('groups totals by month and sorts ascending', () => {
    const records = [
      record({ id: 'a', date: '2026-07-02', totalCost: 100 }),
      record({ id: 'b', date: '2026-07-20', totalCost: 250 }),
      record({ id: 'c', date: '2026-08-01', totalCost: 50 }),
    ]
    const groups = groupCostsByMonth(records)
    expect(groups).toHaveLength(2)
    expect(groups[0].total).toBe(350)
    expect(groups[1].total).toBe(50)
  })

  it('keeps only the last 6 months', () => {
    const records = Array.from({ length: 8 }, (_, i) =>
      record({ id: String(i), date: `2026-0${i + 1}-10`, totalCost: i })
    )
    expect(groupCostsByMonth(records)).toHaveLength(6)
  })
})

describe('currentMonthCost', () => {
  it('sums only records from the current month', () => {
    const now = new Date()
    const pad = (n: number) => String(n + 1).padStart(2, '0')
    const thisMonth = `${now.getFullYear()}-${pad(now.getMonth())}-05`
    const lastYear = `${now.getFullYear() - 1}-${pad(now.getMonth())}-05`
    const records = [
      record({ id: 'a', date: thisMonth, totalCost: 1200 }),
      record({ id: 'b', date: thisMonth, totalCost: 800 }),
      record({ id: 'c', date: lastYear, totalCost: 9999 }),
    ]
    expect(currentMonthCost(records)).toBe(2000)
  })
})
