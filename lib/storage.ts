/**
 * localStorage-based storage layer.
 * This is the primary data store (offline-first).
 * When Prisma/Supabase is configured, API routes take over.
 */

import type { AppSettings, MaintenanceRecord, Vehicle } from '@/types'
import { generateId } from './utils'

const VEHICLES_KEY = 'autocare_vehicles'
const MAINTENANCE_KEY = 'autocare_maintenance'
const SETTINGS_KEY = 'autocare_settings'
const WORKSHOPS_KEY = 'autocare_workshops'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export function getVehicles(): Vehicle[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(VEHICLES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getVehicleById(id: string): Vehicle | undefined {
  return getVehicles().find((v) => v.id === id)
}

export function saveVehicle(
  data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
): Vehicle {
  const vehicles = getVehicles()
  const now = new Date().toISOString()
  const vehicle: Vehicle = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  vehicles.push(vehicle)
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles))
  return vehicle
}

export function updateVehicle(
  id: string,
  data: Partial<Omit<Vehicle, 'id' | 'createdAt'>>
): Vehicle | null {
  const vehicles = getVehicles()
  const idx = vehicles.findIndex((v) => v.id === id)
  if (idx === -1) return null
  vehicles[idx] = { ...vehicles[idx], ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles))
  return vehicles[idx]
}

export function deleteVehicle(id: string): boolean {
  const vehicles = getVehicles().filter((v) => v.id !== id)
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles))
  // Also delete related records
  const records = getMaintenanceRecords().filter((r) => r.vehicleId !== id)
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(records))
  return true
}

// ─── Maintenance Records ──────────────────────────────────────────────────────

export function getMaintenanceRecords(): MaintenanceRecord[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(MAINTENANCE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getRecordsForVehicle(vehicleId: string): MaintenanceRecord[] {
  return getMaintenanceRecords()
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getMaintenanceById(id: string): MaintenanceRecord | undefined {
  return getMaintenanceRecords().find((r) => r.id === id)
}

export function saveMaintenance(
  data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>
): MaintenanceRecord {
  const records = getMaintenanceRecords()
  const now = new Date().toISOString()
  const record: MaintenanceRecord = {
    ...data,
    totalCost: data.partsCost + data.laborCost,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  records.push(record)
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(records))

  // Update vehicle mileage if this record is higher
  const vehicle = getVehicleById(data.vehicleId)
  if (vehicle && data.mileage > vehicle.currentMileage) {
    updateVehicle(data.vehicleId, { currentMileage: data.mileage })
  }

  // Remember workshop
  if (data.workshop) {
    saveWorkshop(data.workshop)
  }

  return record
}

export function updateMaintenance(
  id: string,
  data: Partial<Omit<MaintenanceRecord, 'id' | 'createdAt'>>
): MaintenanceRecord | null {
  const records = getMaintenanceRecords()
  const idx = records.findIndex((r) => r.id === id)
  if (idx === -1) return null
  records[idx] = {
    ...records[idx],
    ...data,
    totalCost: (data.partsCost ?? records[idx].partsCost) + (data.laborCost ?? records[idx].laborCost),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(records))
  return records[idx]
}

export function deleteMaintenance(id: string): boolean {
  const records = getMaintenanceRecords().filter((r) => r.id !== id)
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(records))
  return true
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function getSettings(): AppSettings {
  if (!isBrowser()) return { currency: 'MMK', distanceUnit: 'km' }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw
      ? JSON.parse(raw)
      : { currency: 'MMK', distanceUnit: 'km' }
  } catch {
    return { currency: 'MMK', distanceUnit: 'km' }
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const next = { ...current, ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  return next
}

// ─── Workshops ────────────────────────────────────────────────────────────────

export function getWorkshops(): string[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(WORKSHOPS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveWorkshop(name: string): void {
  const workshops = getWorkshops().filter((w) => w !== name)
  workshops.unshift(name)
  localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(workshops.slice(0, 10)))
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export function exportData(): string {
  return JSON.stringify(
    {
      vehicles: getVehicles(),
      maintenance: getMaintenanceRecords(),
      settings: getSettings(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  )
}

export function importData(json: string): void {
  const data = JSON.parse(json)
  if (data.vehicles) localStorage.setItem(VEHICLES_KEY, JSON.stringify(data.vehicles))
  if (data.maintenance) localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(data.maintenance))
  if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings))
}

export function clearAllData(): void {
  localStorage.removeItem(VEHICLES_KEY)
  localStorage.removeItem(MAINTENANCE_KEY)
  localStorage.removeItem(SETTINGS_KEY)
  localStorage.removeItem(WORKSHOPS_KEY)
}
