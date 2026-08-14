import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { vehicleSchema } from '@/lib/validations'

type Params = { params: { id: string } }

// Helper: verify vehicle belongs to requesting user
async function getOwnedVehicle(id: string, userId: string) {
  return prisma.vehicle.findFirst({ where: { id, userId } })
}

// GET /api/vehicles/[id]
export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vehicle = await getOwnedVehicle(params.id, session.user.id)
  if (!vehicle) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(vehicle)
}

// PATCH /api/vehicles/[id]
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getOwnedVehicle(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = vehicleSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const vehicle = await prisma.vehicle.update({
    where: { id: params.id },
    data: parsed.data,
  })
  return NextResponse.json(vehicle)
}

// DELETE /api/vehicles/[id]
export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getOwnedVehicle(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.vehicle.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
