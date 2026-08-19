'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import { useMaintenance } from '@/hooks/useMaintenance'
import { useVehicles } from '@/hooks/useVehicles'
import { useSettings } from '@/hooks/useSettings'
import {
  formatCurrency,
  groupCostsByMonth,
  currentMonthCost,
} from '@/lib/utils'
import { MAINTENANCE_TYPE_LABELS } from '@/types'
import type { MaintenanceType } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function CostsPage() {
  const { records, loading } = useMaintenance()
  const { vehicles } = useVehicles()
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Show skeleton while loading instead of blank screen
  if (!mounted || loading) {
    return (
      <>
        <Header title="Cost Tracking" />
        <PageShell className="space-y-6">
          {/* Stat cards skeleton */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
          {/* Chart skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
            <div className="h-40 bg-gray-50 rounded-xl" />
          </div>
          {/* Bar rows skeleton */}
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </PageShell>
        <BottomNav />
      </>
    )
  }

  const totalCost = records.reduce((s, r) => s + r.totalCost, 0)
  const monthCost = currentMonthCost(records)

  // By month (last 6)
  const byMonth = groupCostsByMonth(records)

  // By vehicle
  const byVehicle = vehicles.map((v) => ({
    name: `${v.brand} ${v.model}`,
    total: records.filter((r) => r.vehicleId === v.id).reduce((s, r) => s + r.totalCost, 0),
  })).filter((v) => v.total > 0)

  // By type
  const typeMap = new Map<MaintenanceType, number>()
  for (const r of records) {
    typeMap.set(r.type, (typeMap.get(r.type) ?? 0) + r.totalCost)
  }
  const byType = Array.from(typeMap.entries())
    .map(([type, total]) => ({ type, label: MAINTENANCE_TYPE_LABELS[type], total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  // This year
  const yearCost = records
    .filter((r) => new Date(r.date).getFullYear() === new Date().getFullYear())
    .reduce((s, r) => s + r.totalCost, 0)

  const cur = settings.currency

  return (
    <>
      <Header title="Cost Tracking" />

      <PageShell className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <CostStat label="Total" value={formatCurrency(totalCost, cur)} />
          <CostStat label="This Month" value={formatCurrency(monthCost, cur)} />
          <CostStat label="This Year" value={formatCurrency(yearCost, cur)} />
        </div>

        {/* Monthly chart */}
        {byMonth.length > 0 && (
          <section>
            <SectionTitle>Monthly Cost</SectionTitle>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={byMonth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v ?? 0), cur), 'Cost']}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #f3f4f6',
                      fontSize: 12,
                    }}
                    cursor={{ fill: '#f9fafb' }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#1f2937" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* By vehicle */}
        {byVehicle.length > 0 && (
          <section>
            <SectionTitle>By Vehicle</SectionTitle>
            <div className="space-y-2">
              {byVehicle.map((v) => (
                <CostBar
                  key={v.name}
                  label={v.name}
                  value={v.total}
                  max={byVehicle[0].total}
                  currency={cur}
                />
              ))}
            </div>
          </section>
        )}

        {/* By type */}
        {byType.length > 0 && (
          <section>
            <SectionTitle>By Service Type</SectionTitle>
            <div className="space-y-2">
              {byType.map((t) => (
                <CostBar
                  key={t.type}
                  label={t.label}
                  value={t.total}
                  max={byType[0].total}
                  currency={cur}
                />
              ))}
            </div>
          </section>
        )}

        {records.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm font-semibold text-gray-700">No data yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add maintenance records to see cost breakdowns
            </p>
          </div>
        )}
      </PageShell>

      <BottomNav />
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CostStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
      <p className="text-xs font-bold text-gray-900 leading-tight break-words">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
      {children}
    </h2>
  )
}

function CostBar({
  label,
  value,
  max,
  currency,
}: {
  label: string
  value: number
  max: number
  currency: string
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700 truncate">{label}</span>
        <span className="text-xs font-semibold text-gray-900 shrink-0 ml-2">
          {formatCurrency(value, currency)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
