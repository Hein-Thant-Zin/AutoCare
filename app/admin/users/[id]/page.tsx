'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Car, Bike, Crown, Shield } from 'lucide-react'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import BottomNav from '@/components/layout/BottomNav'
import MaintenanceTimeline from '@/components/maintenance/MaintenanceTimeline'
import type { Vehicle, MaintenanceRecord } from '@/types'
import { formatCurrency, formatDate, formatMileage } from '@/lib/utils'

interface AdminUserDetail {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: string
  vehicles: Vehicle[]
  maintenanceRecords: MaintenanceRecord[]
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [promoting, setPromoting] = useState(false)

  const userId = params.id as string

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') { router.replace('/'); return }
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((data) => { setUser(data); setLoading(false) })
  }, [session, status, router, userId])

  const handleRoleToggle = async () => {
    if (!user) return
    setPromoting(true)
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      setUser((prev) => prev ? { ...prev, role: newRole } : prev)
    }
    setPromoting(false)
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Header title="User Detail" showBack />
        <PageShell>
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#20252B]/20 border-t-[#20252B] rounded-full animate-spin" />
          </div>
        </PageShell>
      </>
    )
  }

  if (!user) return null

  const totalCost = user.maintenanceRecords.reduce((s, r) => s + r.totalCost, 0)
  const sortedRecords = [...user.maintenanceRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <>
      <Header title="User Detail" showBack />

      <PageShell className="space-y-5">
        {/* User card */}
        <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-[#E5E8EB] shrink-0">
              {user.image ? (
                <Image src={user.image} alt={user.name ?? ''} width={56} height={56} />
              ) : (
                <div className="w-full h-full bg-[#20252B] flex items-center justify-center text-white text-xl font-bold">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-[#20252B] truncate">{user.name}</p>
                {user.role === 'admin' && <Crown size={14} className="text-[#C08A3E]" strokeWidth={2} />}
              </div>
              <p className="text-xs text-[#69737E] mt-0.5 truncate">{user.email}</p>
              <p className="text-[10px] text-[#B0B8C2] mt-1">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-[#E5E8EB] grid grid-cols-3 gap-3">
            <MiniStat label="Vehicles" value={String(user.vehicles.length)} />
            <MiniStat label="Records" value={String(user.maintenanceRecords.length)} />
            <MiniStat label="Total Cost" value={formatCurrency(totalCost, 'MMK')} small />
          </div>
        </div>

        {/* Role management */}
        {session?.user?.id !== userId && (
          <div className="bg-white rounded-xl border border-[#E5E8EB] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#20252B]">Role: <span className="capitalize">{user.role}</span></p>
                <p className="text-[10px] text-[#69737E] mt-0.5">
                  {user.role === 'admin' ? 'Can access admin panel and all data' : 'Standard user access'}
                </p>
              </div>
              <button
                onClick={handleRoleToggle}
                disabled={promoting}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all disabled:opacity-50"
                style={user.role === 'admin'
                  ? { borderColor: '#C45B5B', color: '#C45B5B', backgroundColor: '#FDF2F2' }
                  : { borderColor: '#20252B', color: '#20252B', backgroundColor: '#F8F9FA' }
                }
              >
                <Shield size={13} strokeWidth={2} />
                {promoting ? '…' : user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </button>
            </div>
          </div>
        )}

        {/* Vehicles */}
        {user.vehicles.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#69737E] uppercase tracking-widest mb-3">
              Vehicles ({user.vehicles.length})
            </p>
            <div className="space-y-2">
              {user.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E8EB] p-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F3F6] flex items-center justify-center shrink-0">
                    {vehicle.type === 'motorcycle'
                      ? <Bike size={16} strokeWidth={1.8} className="text-[#718196]" />
                      : <Car size={16} strokeWidth={1.8} className="text-[#718196]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#20252B] truncate">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-[11px] text-[#69737E]">
                      {vehicle.year} · {formatMileage(vehicle.currentMileage)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance timeline */}
        {sortedRecords.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#69737E] uppercase tracking-widest mb-3">
              Maintenance History ({sortedRecords.length})
            </p>
            <MaintenanceTimeline records={sortedRecords} currency="MMK" />
          </div>
        )}
      </PageShell>

      <BottomNav />
    </>
  )
}

function MiniStat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="bg-[#F8F9FA] rounded-xl p-3">
      <p className="text-[9px] font-semibold text-[#69737E] uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-bold text-[#20252B] leading-snug ${small ? 'text-xs' : 'text-sm'}`}>{value}</p>
    </div>
  )
}
