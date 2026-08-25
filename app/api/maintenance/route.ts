import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { maintenanceSchema } from '@/lib/validations'
import { createMaintenanceRecord } from '@/lib/records'
import { serializeDecimals } from '@/lib/serialize'

// GET /api/maintenance — list current user's records (optional ?vehicleId=xxx)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const vehicleId = searchParams.get('vehicleId')

  const records = await prisma.maintenanceRecord.findMany({
    where: {
      userId: session.user.id,
      ...(vehicleId ? { vehicleId } : {}),
    },
    include: { items: true },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(serializeDecimals(records))
}

// POST /api/maintenance — create a new maintenance record with optional line items
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = maintenanceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const record = await createMaintenanceRecord(
    session.user.id,
    parsed.data.vehicleId,
    parsed.data
  )
  if (!record) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  return NextResponse.json(record, { status: 201 })
}
