'use client'

import Link from 'next/link'
import { ChevronRight, Gauge } from 'lucide-react'
import type { MaintenanceRecord, Vehicle } from '@/types'
import { formatDate, formatMileage, getReminderStatus, reminderStatusColor, reminderStatusLabel, vehicleName } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface VehicleCardProps {
  vehicle: Vehicle
  lastRecord?: MaintenanceRecord
}

const vehicleIcon = (type: string) =>
  type === 'motorcycle' ? '🏍️' : '🚗'

export default function VehicleCard({ vehicle, lastRecord }: VehicleCardProps) {
  const status = getReminderStatus(lastRecord, vehicle.currentMileage)
  const statusClass = reminderStatusColor(status)
  const showReminder = status !== 'ok'

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        {/* Vehicle photo or icon */}
        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
          {vehicle.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vehicle.photo} alt={vehicleName(vehicle)} className="w-full h-full object-cover" />
          ) : (
            vehicleIcon(vehicle.type)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {vehicle.brand} {vehicle.model}
              </p>
              <p className="text-xs text-gray-400">{vehicle.year} · {vehicle.licensePlate}</p>
            </div>
            {showReminder && (
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0', statusClass)}>
                {reminderStatusLabel(status)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Gauge size={12} />
              {formatMileage(vehicle.currentMileage)}
            </span>
          </div>

          {lastRecord && (
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Last: {formatDate(lastRecord.date)}
              </span>
              {lastRecord.nextServiceMileage && (
                <span className="text-xs text-gray-400">
                  Next: {formatMileage(lastRecord.nextServiceMileage)}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronRight size={16} className="text-gray-300 shrink-0 mt-0.5" />
      </div>
    </Link>
  )
}
