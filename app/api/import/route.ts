import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { vehicleSchema, maintenanceSchema } from '@/lib/validations'
import { createMaintenanceRecord } from '@/lib/records'

const importSchema = z.object({
  vehicles: z.array(vehicleSchema.extend({ id: z.string().min(1) })).max(200).optional(),
  maintenance: z.array(maintenanceSchema).max(5000).optional(),
})

// POST /api/import — restore vehicles + maintenance records from a backup export
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = importSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { vehicles, maintenance } = parsed.data
  const userId = session.user.id
  const idMap = new Map<string, string>()
  let importedRecords = 0

  for (const v of vehicles ?? []) {
    const { id, ...data } = v
    const created = await prisma.vehicle.create({ data: { ...data, userId } })
    idMap.set(id, created.id)
  }

  for (const r of maintenance ?? []) {
    const newVehicleId = idMap.get(r.vehicleId)
    if (!newVehicleId) continue // record belongs to a vehicle not in this backup
    const record = await createMaintenanceRecord(userId, newVehicleId, r)
    if (record) importedRecords++
  }

  return NextResponse.json(
    { importedVehicles: idMap.size, importedRecords },
    { status: 201 }
  )
}
