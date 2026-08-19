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
    include: { items: true },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(records)
}

// POST /api/maintenance — create a new maintenance record with optional line items
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = maintenanceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { items, ...recordData } = parsed.data

  // Verify vehicle belongs to user
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: parsed.data.vehicleId, userId: session.user.id },
  })
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  // If items provided, compute totals from them
  let partsCost = recordData.partsCost
  let laborCost = recordData.laborCost
  let totalCost = recordData.totalCost
  let primaryType = recordData.type ?? 'other'

  if (items && items.length > 0) {
    partsCost = items.reduce((s, i) => s + i.partsCost, 0)
    laborCost = items.reduce((s, i) => s + i.laborCost, 0)
    totalCost = partsCost + laborCost
    primaryType = items[0].type // first item is the primary type
  }

  // Update vehicle mileage if record mileage is higher
  if (parsed.data.mileage > vehicle.currentMileage) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { currentMileage: parsed.data.mileage },
    })
  }

  // Create record + items in a transaction
  const record = await prisma.$transaction(async (tx) => {
    const r = await tx.maintenanceRecord.create({
      data: {
        vehicleId: recordData.vehicleId,
        userId: session.user.id,
        date: recordData.date,
        mileage: recordData.mileage,
        type: primaryType,
        description: recordData.description,
        partsReplaced: recordData.partsReplaced,
        partsCost,
        laborCost,
        totalCost,
        workshop: recordData.workshop,
        notes: recordData.notes,
        receiptPhoto: recordData.receiptPhoto,
        nextServiceDate: recordData.nextServiceDate,
        nextServiceMileage: recordData.nextServiceMileage,
      },
    })

    if (items && items.length > 0) {
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

  return NextResponse.json(record, { status: 201 })
}
