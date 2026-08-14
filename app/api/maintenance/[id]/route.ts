import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

type Params = { params: { id: string } }

async function getOwnedRecord(id: string, userId: string) {
  return prisma.maintenanceRecord.findFirst({ where: { id, userId } })
}

// DELETE /api/maintenance/[id]
export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getOwnedRecord(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.maintenanceRecord.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
