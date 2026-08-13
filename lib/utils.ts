import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MaintenanceRecord, ReminderStatus, Vehicle } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'MMK'): string {
  return `${Math.round(amount).toLocaleString()} ${currency}`
}

// ─── Mileage ──────────────────────────────────────────────────────────────────

export function formatMileage(km: number, unit = 'km'): string {
  return `${km.toLocaleString()} ${unit}`
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function monthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

// ─── Reminder status ──────────────────────────────────────────────────────────

export function getReminderStatus(
  record: MaintenanceRecord | undefined,
  currentMileage: number
): ReminderStatus {
  if (!record) return 'ok'

  const today = todayISO()
  let dateStatus: ReminderStatus = 'ok'
  let mileageStatus: ReminderStatus = 'ok'

  if (record.nextServiceDate) {
    const days = daysBetween(today, record.nextServiceDate)
    if (days < 0) dateStatus = 'overdue'
    else if (days <= 14) dateStatus = 'due_soon'
    else dateStatus = 'ok'
  }

  if (record.nextServiceMileage) {
    const kmLeft = record.nextServiceMileage - currentMileage
    if (kmLeft <= 0) mileageStatus = 'overdue'
    else if (kmLeft <= 500) mileageStatus = 'due_soon'
    else mileageStatus = 'ok'
  }

  if (dateStatus === 'overdue' || mileageStatus === 'overdue') return 'overdue'
  if (dateStatus === 'due_soon' || mileageStatus === 'due_soon') return 'due_soon'
  return 'ok'
}

export function reminderStatusLabel(status: ReminderStatus): string {
  switch (status) {
    case 'overdue': return 'Overdue'
    case 'due_soon': return 'Due Soon'
    case 'due': return 'Due'
    default: return 'OK'
  }
}

export function reminderStatusColor(status: ReminderStatus): string {
  switch (status) {
    case 'overdue': return 'text-red-600 bg-red-50 border-red-100'
    case 'due_soon': return 'text-amber-600 bg-amber-50 border-amber-100'
    case 'due': return 'text-amber-700 bg-amber-100 border-amber-200'
    default: return 'text-green-600 bg-green-50 border-green-100'
  }
}

// ─── Vehicle name ─────────────────────────────────────────────────────────────

export function vehicleName(v: Vehicle): string {
  return `${v.brand} ${v.model} ${v.year}`
}

// ─── ID generator ─────────────────────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ─── Cost grouping ────────────────────────────────────────────────────────────

export function groupCostsByMonth(
  records: MaintenanceRecord[]
): { month: string; total: number }[] {
  const map = new Map<string, number>()
  for (const r of records) {
    const key = monthKey(r.date)
    map.set(key, (map.get(key) ?? 0) + r.totalCost)
  }
  return Array.from(map.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6)
}

export function currentMonthCost(records: MaintenanceRecord[]): number {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  return records
    .filter((r) => {
      const d = new Date(r.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    .reduce((sum, r) => sum + r.totalCost, 0)
}
