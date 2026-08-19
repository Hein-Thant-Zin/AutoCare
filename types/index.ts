// ─── Vehicle ────────────────────────────────────────────────────────────────

export type VehicleType = 'motorcycle' | 'car'

export interface Vehicle {
  id: string
  type: VehicleType
  brand: string
  model: string
  year: number
  licensePlate: string
  color?: string
  currentMileage: number
  purchaseDate?: string
  notes?: string
  photo?: string
  createdAt: string
  updatedAt: string
}

// ─── Maintenance ─────────────────────────────────────────────────────────────

export const MAINTENANCE_TYPES = [
  'engine_oil',
  'oil_filter',
  'air_filter',
  'brake',
  'tire',
  'battery',
  'chain',
  'suspension',
  'electrical',
  'cooling_system',
  'transmission',
  'general_service',
  'repair',
  'other',
] as const

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number]

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  engine_oil: 'Engine Oil',
  oil_filter: 'Oil Filter',
  air_filter: 'Air Filter',
  brake: 'Brake',
  tire: 'Tire',
  battery: 'Battery',
  chain: 'Chain',
  suspension: 'Suspension',
  electrical: 'Electrical',
  cooling_system: 'Cooling System',
  transmission: 'Transmission',
  general_service: 'General Service',
  repair: 'Repair',
  other: 'Other',
}

// ─── Line Item ───────────────────────────────────────────────────────────────

export interface MaintenanceItem {
  id: string
  recordId: string
  type: MaintenanceType
  description?: string
  partsCost: number
  laborCost: number
  totalCost: number
}

// ─── Maintenance Record ───────────────────────────────────────────────────────

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  date: string
  mileage: number
  type: MaintenanceType        // primary type (derived from first item or manual)
  description?: string
  partsReplaced?: string
  partsCost: number
  laborCost: number
  totalCost: number
  workshop?: string
  notes?: string
  receiptPhoto?: string
  nextServiceDate?: string
  nextServiceMileage?: number
  createdAt: string
  updatedAt: string
  items?: MaintenanceItem[]   // line items breakdown
}

// ─── Reminder ─────────────────────────────────────────────────────────────────

export type ReminderStatus = 'ok' | 'due_soon' | 'due' | 'overdue'

export interface VehicleReminder {
  vehicle: Vehicle
  lastRecord?: MaintenanceRecord
  status: ReminderStatus
  nextServiceDate?: string
  nextServiceMileage?: number
  daysUntilDue?: number
  kmUntilDue?: number
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  currency: string
  defaultVehicleId?: string
  distanceUnit: 'km' | 'mi'
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface CostStat {
  month: string
  total: number
}

export interface VehicleCostStat {
  vehicleId: string
  vehicleName: string
  total: number
}

export interface TypeCostStat {
  type: MaintenanceType
  label: string
  total: number
}
