'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, X } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import MaintenanceTimeline from '@/components/maintenance/MaintenanceTimeline'
import { useMaintenance } from '@/hooks/useMaintenance'
import { useVehicles } from '@/hooks/useVehicles'
import { useSettings } from '@/hooks/useSettings'
import type { MaintenanceType } from '@/types'
import { MAINTENANCE_TYPE_LABELS, MAINTENANCE_TYPES } from '@/types'
import { cn } from '@/lib/utils'

export default function MaintenancePage() {
  const { records, loading, removeRecord } = useMaintenance()
  const { vehicles } = useVehicles()
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)

  const [search, setSearch] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterType, setFilterType] = useState<MaintenanceType | ''>('')

  useEffect(() => setMounted(true), [])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterVehicle && r.vehicleId !== filterVehicle) return false
      if (filterType && r.type !== filterType) return false
      if (search) {
        const s = search.toLowerCase()
        const vehicle = vehicles.find((v) => v.id === r.vehicleId)
        const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model}`.toLowerCase() : ''
        return (
          MAINTENANCE_TYPE_LABELS[r.type].toLowerCase().includes(s) ||
          (r.description?.toLowerCase().includes(s) ?? false) ||
          (r.workshop?.toLowerCase().includes(s) ?? false) ||
          vehicleStr.includes(s)
        )
      }
      return true
    })
  }, [records, filterVehicle, filterType, search, vehicles])

  const hasFilters = !!search || !!filterVehicle || !!filterType

  if (!mounted) return null


  return (
    <>
      <Header
        title="Maintenance"
        right={
          <Link
            href="/maintenance/new"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add
          </Link>
        }
      />

      <PageShell className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Vehicle filter */}
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer focus:outline-none transition-all',
              filterVehicle
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200'
            )}
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>

          {/* Type filter chips */}
          <button
            onClick={() => setFilterType('')}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
              !filterType
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            )}
          >
            All Types
          </button>
          {MAINTENANCE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t === filterType ? '' : t)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                filterType === t
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {MAINTENANCE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterVehicle(''); setFilterType('') }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear filters · {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </button>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <MaintenanceTimeline
            records={filtered}
            currency={settings.currency}
            onDelete={removeRecord}
          />
        )}
      </PageShell>

      <BottomNav />
    </>
  )
}
