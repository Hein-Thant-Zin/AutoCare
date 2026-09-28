import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { vehicleSchema } from '@/lib/validations'
import { normalizeVehicleData } from '@/lib/records'
import { serializeDecimals } from '@/lib/serialize'

// GET /api/vehicles — list current user's vehicles
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(serializeDecimals(vehicles))
}

// POST /api/vehicles — create a new vehicle
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = vehicleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const vehicle = await prisma.vehicle.create({
    data: { ...normalizeVehicleData(parsed.data), userId: session.user.id },
  })
  return NextResponse.json(serializeDecimals(vehicle), { status: 201 })
}

// DELETE /api/vehicles — delete all current user's vehicles (records cascade)
export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.vehicle.deleteMany({ where: { userId: session.user.id } })
  return NextResponse.json({ success: true })
}
