import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/stats — aggregate stats for admin dashboard
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [totalUsers, totalVehicles, totalRecords, totalCostAgg] = await Promise.all([
    prisma.user.count(),
    prisma.vehicle.count(),
    prisma.maintenanceRecord.count(),
    prisma.maintenanceRecord.aggregate({ _sum: { totalCost: true } }),
  ])

  return NextResponse.json({
    totalUsers,
    totalVehicles,
    totalRecords,
    totalCost: totalCostAgg._sum.totalCost ?? 0,
  })
}
