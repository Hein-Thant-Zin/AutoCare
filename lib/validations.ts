import { z } from 'zod'

// ─── Vehicle Schema ───────────────────────────────────────────────────────────

export const vehicleSchema = z.object({
  type: z.enum(['motorcycle', 'car']),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, 'License plate is required'),
  color: z.string().optional(),
  currentMileage: z.coerce.number().min(0, 'Mileage must be 0 or more'),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
  photo: z.string().optional(),
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>

// ─── Maintenance Item Schema ──────────────────────────────────────────────────

export const MAINTENANCE_TYPE_VALUES = [
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

export const maintenanceItemSchema = z.object({
  type: z.enum(MAINTENANCE_TYPE_VALUES),
  description: z.string().optional(),
  partsCost: z.coerce.number().min(0).default(0),
  laborCost: z.coerce.number().min(0).default(0),
})

export type MaintenanceItemValues = z.infer<typeof maintenanceItemSchema>

// ─── Maintenance Record Schema ────────────────────────────────────────────────

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  date: z.string().min(1, 'Date is required'),
  mileage: z.coerce.number().min(0, 'Mileage must be 0 or more'),
  // Legacy single-item fields (kept for backwards compatibility)
  type: z.enum(MAINTENANCE_TYPE_VALUES).optional(),
  description: z.string().optional(),
  partsReplaced: z.string().optional(),
  partsCost: z.coerce.number().min(0).default(0),
  laborCost: z.coerce.number().min(0).default(0),
  totalCost: z.coerce.number().min(0).default(0),
  workshop: z.string().optional(),
  notes: z.string().optional(),
  receiptPhoto: z.string().optional(),
  nextServiceDate: z.string().optional(),
  nextServiceMileage: z.coerce.number().optional(),
  // Multi-item line items
  items: z.array(maintenanceItemSchema).min(1, 'At least one service item is required').optional(),
})

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>
