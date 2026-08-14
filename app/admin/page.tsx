'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Car, Wrench, TrendingUp, ChevronRight, Shield, Crown } from 'lucide-react'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import BottomNav from '@/components/layout/BottomNav'
import { formatCurrency } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  totalVehicles: number
  totalRecords: number
  totalCost: number
}

interface AdminUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: string
  _count: { vehicles: number; maintenanceRecords: number }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.replace('/')
      return
    }
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
    ]).then(([s, u]) => {
      setStats(s)
      setUsers(u)
      setLoading(false)
    })
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <>
        <Header title="Admin Panel" showBack />
        <PageShell>
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#20252B]/20 border-t-[#20252B] rounded-full animate-spin" />
          </div>
        </PageShell>
      </>
    )
  }

  return (
    <>
      <Header title="Admin Panel" showBack />

      <PageShell className="space-y-6">
        {/* Admin badge */}
        <div className="flex items-center gap-2 bg-[#20252B] rounded-xl px-4 py-3">
          <Shield size={16} className="text-white/70" strokeWidth={1.8} />
          <div>
            <p className="text-xs font-semibold text-white">Administrator</p>
            <p className="text-[10px] text-white/50">{session?.user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <AdminStat icon={<Users size={15} strokeWidth={1.8} />} label="Total Users" value={stats.totalUsers} />
            <AdminStat icon={<Car size={15} strokeWidth={1.8} />} label="Vehicles" value={stats.totalVehicles} />
            <AdminStat icon={<Wrench size={15} strokeWidth={1.8} />} label="Records" value={stats.totalRecords} />
            <AdminStat
              icon={<TrendingUp size={15} strokeWidth={1.8} />}
              label="Total Spend"
              value={formatCurrency(stats.totalCost, 'MMK')}
              small
            />
          </div>
        )}

        {/* Users list */}
        <div>
          <p className="text-[10px] font-semibold text-[#69737E] uppercase tracking-widest mb-3">
            All Users ({users.length})
          </p>
          <div className="space-y-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E8EB] shadow-card p-3.5 hover:shadow-card-hover transition-all active:scale-[0.99]"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E5E8EB] shrink-0">
                  {user.image ? (
                    <Image src={user.image} alt={user.name ?? ''} width={40} height={40} />
                  ) : (
                    <div className="w-full h-full bg-[#20252B] flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#20252B] truncate">
                      {user.name ?? 'Unknown'}
                    </p>
                    {user.role === 'admin' && (
                      <Crown size={12} className="text-[#C08A3E] shrink-0" strokeWidth={2} />
                    )}
                  </div>
                  <p className="text-[11px] text-[#69737E] truncate">{user.email}</p>
                  <p className="text-[10px] text-[#B0B8C2] mt-0.5">
                    {user._count.vehicles} vehicles · {user._count.maintenanceRecords} records
                  </p>
                </div>

                <ChevronRight size={15} className="text-[#B0B8C2] shrink-0" strokeWidth={1.8} />
              </Link>
            ))}
          </div>
        </div>
      </PageShell>

      <BottomNav />
    </>
  )
}

function AdminStat({
  icon,
  label,
  value,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  small?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-[#69737E] uppercase tracking-widest">{label}</span>
        <span className="text-[#20252B]">{icon}</span>
      </div>
      <p className={`font-bold text-[#20252B] leading-tight ${small ? 'text-base' : 'text-2xl'}`}>
        {value}
      </p>
    </div>
  )
}
