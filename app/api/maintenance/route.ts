import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { maintenanceSchema } from '@/lib/validations'

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
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(records)
}

// POST /api/maintenance — create a new maintenance record
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = maintenanceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Verify vehicle belongs to user
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: parsed.data.vehicleId, userId: session.user.id },
  })
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  // Update vehicle mileage if record mileage is higher
  if (parsed.data.mileage > vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { currentMileage: parsed.data.mileage },
    })
  }

  const record = await prisma.maintenanceRecord.create({
    data: { ...parsed.data, userId: session.user.id },
  })
  return NextResponse.json(record, { status: 201 })
}
