import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { serializeDecimals } from '@/lib/serialize'

type RecordInput = {
  date: string | Date
  mileage: number
  type?: string
  description?: string
  partsReplaced?: string
  partsCost: number
  laborCost: number
  totalCost: number
  workshop?: string
  notes?: string
  receiptPhoto?: string
  nextServiceDate?: string | Date
  nextServiceMileage?: number
  items?: { type: string; description?: string; partsCost: number; laborCost: number }[]
}

/** Converts an ISO date string (or Date) into a Date, ignoring empty values */
export function toDate(value?: string | Date): Date | undefined {
  if (value == null || value === '') return undefined
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

/** Converts vehicle form data for Prisma (purchaseDate string → DateTime) */
export function normalizeVehicleData<T extends { purchaseDate?: string }>(
  data: T
): Omit<T, 'purchaseDate'> & { purchaseDate?: Date } {
  const { purchaseDate, ...rest } = data
  const date = toDate(purchaseDate)
  return { ...rest, ...(date ? { purchaseDate: date } : {}) }
}

/**
 * Creates a maintenance record (with optional line items) for a vehicle,
 * bumping the vehicle's mileage when the record's is higher.
 * Returns the serialized record including items.
 */
export async function createMaintenanceRecord(
  userId: string,
  vehicleId: string,
  input: RecordInput
): Promise<Prisma.MaintenanceRecordGetPayload<{ include: { items: true } }> | null> {
  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId } })
  if (!vehicle) return null

  let { partsCost, laborCost, totalCost, type } = input
  const items = input.items ?? []

  if (items.length > 0) {
    partsCost = items.reduce((s, i) => s + i.partsCost, 0)
    laborCost = items.reduce((s, i) => s + i.laborCost, 0)
    totalCost = partsCost + laborCost
    type = items[0].type // first item is the primary type
  }

  if (!type) type = 'other'

  if (input.mileage > vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { currentMileage: input.mileage },
    })
  }

  const record = await prisma.$transaction(async (tx) => {
    const r = await tx.maintenanceRecord.create({
      data: {
        vehicleId,
        userId,
        date: toDate(input.date)!,
        mileage: input.mileage,
        type,
        description: input.description,
        partsReplaced: input.partsReplaced,
        partsCost,
        laborCost,
        totalCost,
        workshop: input.workshop,
        notes: input.notes,
        receiptPhoto: input.receiptPhoto,
        nextServiceDate: toDate(input.nextServiceDate),
        nextServiceMileage: input.nextServiceMileage,
      },
    })

    if (items.length > 0) {
      await tx.maintenanceItem.createMany({
        data: items.map((item) => ({
          recordId: r.id,
          type: item.type,
          description: item.description,
          partsCost: item.partsCost,
          laborCost: item.laborCost,
          totalCost: item.partsCost + item.laborCost,
        })),
      })
    }

    return tx.maintenanceRecord.findUnique({
      where: { id: r.id },
      include: { items: true },
    })
  })

  return record ? serializeDecimals(record) : null
}
