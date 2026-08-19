'use client'

import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { MaintenanceRecord } from '@/types'
import { MAINTENANCE_TYPE_LABELS } from '@/types'
import { formatCurrency, formatDate, formatMileage } from '@/lib/utils'

interface MaintenanceTimelineProps {
  records: MaintenanceRecord[]
  currency?: string
  onDelete?: (id: string) => void
}

export default function MaintenanceTimeline({
  records,
  currency = 'MMK',
  onDelete,
}: MaintenanceTimelineProps) {
  if (records.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center gap-2 text-center">
        <span className="text-4xl">🔧</span>
        <p className="text-sm font-medium text-gray-700">No maintenance records yet</p>
        <p className="text-xs text-gray-400">Add your first record to start tracking</p>
      </div>
    )
  }

  const grouped = groupByMonth(records)

  return (
    <div className="space-y-6">
      {grouped.map(({ monthLabel, items }) => (
        <div key={monthLabel}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {monthLabel}
          </p>
          <div className="space-y-2">
            {items.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                currency={currency}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RecordCard({
  record,
  currency,
  onDelete,
}: {
  record: MaintenanceRecord
  currency: string
  onDelete?: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasItems = record.items && record.items.length > 0
  const multiItem = hasItems && record.items!.length > 1

  // Title: show all item types if multi-item
  const title = hasItems
    ? record.items!.map((i) => MAINTENANCE_TYPE_LABELS[i.type as keyof typeof MAINTENANCE_TYPE_LABELS]).join(' · ')
    : MAINTENANCE_TYPE_LABELS[record.type]

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Main row */}
      <div className="flex items-start gap-3 p-3.5">
        <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                {title}
              </p>
              {!hasItems && record.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{record.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(record.totalCost, currency)}
              </p>
              {multiItem && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-400">{formatDate(record.date)}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{formatMileage(record.mileage)}</span>
            {record.workshop && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 truncate">{record.workshop}</span>
              </>
            )}
            {hasItems && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">{record.items!.length} service{record.items!.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {(record.nextServiceDate || record.nextServiceMileage) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <span className="text-gray-300">Next:</span>
              {record.nextServiceMileage && <span>{formatMileage(record.nextServiceMileage)}</span>}
              {record.nextServiceDate && record.nextServiceMileage && <span>or</span>}
              {record.nextServiceDate && <span>{formatDate(record.nextServiceDate)}</span>}
            </div>
          )}
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(record.id)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
            aria-label="Delete record"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Expanded items breakdown */}
      {hasItems && (expanded || !multiItem) && (
        <div className="border-t border-gray-50 px-3.5 pb-3 pt-2 space-y-1.5">
          {record.items!.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0" />
                <span className="text-gray-600 font-medium">
                  {MAINTENANCE_TYPE_LABELS[item.type as keyof typeof MAINTENANCE_TYPE_LABELS]}
                </span>
                {item.description && (
                  <span className="text-gray-400 truncate">— {item.description}</span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2 text-gray-500">
                {item.partsCost > 0 && (
                  <span>Parts: {formatCurrency(item.partsCost, currency)}</span>
                )}
                {item.laborCost > 0 && (
                  <span>Labor: {formatCurrency(item.laborCost, currency)}</span>
                )}
                <span className="font-semibold text-gray-700">
                  {formatCurrency(item.totalCost, currency)}
                </span>
              </div>
            </div>
          ))}
          {/* Total row */}
          {multiItem && (
            <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-1.5 mt-1.5">
              <span className="text-gray-400 font-medium">Total</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(record.totalCost, currency)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByMonth(
  records: MaintenanceRecord[]
): { monthLabel: string; items: MaintenanceRecord[] }[] {
  const map = new Map<string, MaintenanceRecord[]>()
  for (const r of records) {
    const d = new Date(r.date)
    const key = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return Array.from(map.entries()).map(([monthLabel, items]) => ({ monthLabel, items }))
}
