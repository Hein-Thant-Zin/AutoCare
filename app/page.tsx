'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, AlertTriangle, Clock, Car } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageSkeleton from '@/components/layout/PageSkeleton'
import PageShell from '@/components/layout/PageShell'
import { useVehicles } from '@/hooks/useVehicles'
import { useMaintenance } from '@/hooks/useMaintenance'
import { useSettings } from '@/hooks/useSettings'
import {
  currentMonthCost,
  formatCurrency,
  formatDate,
  formatMileage,
  getReminderStatus,
  reminderStatusColor,
  reminderStatusLabel,
} from '@/lib/utils'
import { MAINTENANCE_TYPE_LABELS } from '@/types'

export default function DashboardPage() {
  const { vehicles } = useVehicles()
  const { records } = useMaintenance()
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const reminders = useMemo(() => {
    return vehicles.map((v) => {
      const vehicleRecords = records
        .filter((r) => r.vehicleId === v.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const last = vehicleRecords[0]
      const status = getReminderStatus(last, v.currentMileage)
      return { vehicle: v, lastRecord: last, status }
    })
  }, [vehicles, records])

  const dueSoon = reminders.filter((r) => r.status === 'due_soon').length
  const overdue = reminders.filter((r) => r.status === 'overdue').length
  const monthCost = useMemo(() => currentMonthCost(records), [records])
  const recentRecords = records.slice(0, 5)

  if (!mounted) return <PageSkeleton />

  return (
    <>
      <Header
        title="AutoCare"
        right={
          <Link
            href="/vehicles/new"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
          >
            <Plus size={14} />
            Vehicle
          </Link>
        }
      />

      <PageShell className="space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Car size={18} className="text-gray-400" />}
            label="Vehicles"
            value={vehicles.length.toString()}
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-gray-400" />}
            label="This Month"
            value={formatCurrency(monthCost, settings.currency)}
            small
          />
          <StatCard
            icon={<Clock size={18} className="text-amber-500" />}
            label="Due Soon"
            value={dueSoon.toString()}
            highlight={dueSoon > 0 ? 'amber' : undefined}
          />
          <StatCard
            icon={<AlertTriangle size={18} className="text-red-500" />}
            label="Overdue"
            value={overdue.toString()}
            highlight={overdue > 0 ? 'red' : undefined}
          />
        </div>

        {/* Vehicles overview */}
        {vehicles.length > 0 ? (
          <section>
            <SectionTitle>Your Vehicles</SectionTitle>
            <div className="space-y-3">
              {reminders.map(({ vehicle, lastRecord, status }) => (
                <Link
                  key={vehicle.id}
                  href={`/vehicles/${vehicle.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {vehicle.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                      ) : vehicle.type === 'motorcycle' ? '🏍️' : '🚗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        {status !== 'ok' && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${reminderStatusColor(status)}`}>
                            {reminderStatusLabel(status)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatMileage(vehicle.currentMileage)} · {vehicle.licensePlate}
                      </p>
                      {lastRecord && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Last: {formatDate(lastRecord.date)}
                          {lastRecord.nextServiceMileage && ` · Next: ${formatMileage(lastRecord.nextServiceMileage)}`}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <EmptyVehicles />
        )}

        {/* Recent maintenance */}
        {recentRecords.length > 0 && (
          <section>
            <SectionTitle href="/maintenance">Recent Maintenance</SectionTitle>
            <div className="space-y-2">
              {recentRecords.map((record) => {
                const vehicle = vehicles.find((v) => v.id === record.vehicleId)
                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {MAINTENANCE_TYPE_LABELS[record.type]}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'} · {formatDate(record.date)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 shrink-0">
                      {formatCurrency(record.totalCost, settings.currency)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </PageShell>

      <BottomNav />
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  small,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  small?: boolean
  highlight?: 'amber' | 'red'
}) {
  return (
    <div
      className={`bg-white rounded-2xl border p-4 shadow-sm ${
        highlight === 'red'
          ? 'border-red-100'
          : highlight === 'amber'
          ? 'border-amber-100'
          : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p
        className={`font-bold text-gray-900 ${
          small ? 'text-base' : 'text-2xl'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function SectionTitle({
  children,
  href,
}: {
  children: React.ReactNode
  href?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {children}
      </h2>
      {href && (
        <Link href={href} className="text-xs text-gray-400 hover:text-gray-600">
          See all →
        </Link>
      )}
    </div>
  )
}

function EmptyVehicles() {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
      <p className="text-3xl mb-3">🚗</p>
      <p className="text-sm font-semibold text-gray-700">No vehicles yet</p>
      <p className="text-xs text-gray-400 mt-1 mb-4">
        Add your first vehicle to start tracking maintenance
      </p>
      <Link
        href="/vehicles/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
      >
        <Plus size={16} />
        Add Vehicle
      </Link>
    </div>
  )
}
