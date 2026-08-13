'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import MaintenanceTimeline from '@/components/maintenance/MaintenanceTimeline'
import { useVehicles } from '@/hooks/useVehicles'
import { useMaintenance } from '@/hooks/useMaintenance'
import { useSettings } from '@/hooks/useSettings'
import {
  formatCurrency,
  formatDate,
  formatMileage,
  getReminderStatus,
  reminderStatusColor,
  reminderStatusLabel,
  vehicleName,
} from '@/lib/utils'

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { vehicles, removeVehicle, loading: vLoading } = useVehicles()
  const { records, removeRecord } = useMaintenance(id)
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => setMounted(true), [])

  const vehicle = useMemo(() => vehicles.find((v) => v.id === id), [vehicles, id])

  if (!mounted) return null
  if (!vLoading && !vehicle) {
    return (
      <>
        <Header title="Not Found" showBack />
        <PageShell>
          <p className="text-sm text-gray-500 text-center py-12">Vehicle not found.</p>
        </PageShell>
        <BottomNav />
      </>
    )
  }
  if (!vehicle) return null

  const lastRecord = records[0]
  const totalCost = records.reduce((sum, r) => sum + r.totalCost, 0)
  const status = getReminderStatus(lastRecord, vehicle.currentMileage)

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    removeVehicle(id)
    router.push('/vehicles')
  }

  return (
    <>
      <Header
        title={`${vehicle.brand} ${vehicle.model}`}
        showBack
        right={
          <Link
            href={`/vehicles/${id}/edit`}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Edit2 size={16} />
          </Link>
        }
      />

      <PageShell className="space-y-5">
        {/* Vehicle info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {vehicle.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.photo}
              alt={vehicleName(vehicle)}
              className="w-full h-40 object-cover"
            />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-sm text-gray-400">{vehicle.year} · {vehicle.color ?? ''}</p>
              </div>
              {status !== 'ok' && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${reminderStatusColor(status)}`}>
                  {reminderStatusLabel(status)}
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <InfoItem label="License Plate" value={vehicle.licensePlate} />
              <InfoItem label="Mileage" value={formatMileage(vehicle.currentMileage)} />
              <InfoItem label="Total Cost" value={formatCurrency(totalCost, settings.currency)} />
              <InfoItem label="Records" value={records.length.toString()} />
              {lastRecord && (
                <>
                  <InfoItem label="Last Service" value={formatDate(lastRecord.date)} />
                  {lastRecord.nextServiceMileage && (
                    <InfoItem label="Next Service" value={formatMileage(lastRecord.nextServiceMileage)} />
                  )}
                </>
              )}
              {vehicle.purchaseDate && (
                <InfoItem label="Purchased" value={formatDate(vehicle.purchaseDate)} />
              )}
            </div>

            {vehicle.notes && (
              <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                {vehicle.notes}
              </p>
            )}
          </div>
        </div>

        {/* Add maintenance CTA */}
        <Link
          href={`/maintenance/new?vehicleId=${id}`}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          <Plus size={18} />
          Add Maintenance Record
        </Link>

        {/* History */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Maintenance History
          </p>
          <MaintenanceTimeline
            records={records}
            currency={settings.currency}
            onDelete={(recordId) => removeRecord(recordId)}
          />
        </section>

        {/* Delete vehicle */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleDelete}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
              confirming
                ? 'bg-red-500 text-white'
                : 'text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-100'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Trash2 size={15} />
              {confirming ? 'Tap again to confirm delete' : 'Delete Vehicle'}
            </span>
          </button>
          {confirming && (
            <button
              onClick={() => setConfirming(false)}
              className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </PageShell>

      <BottomNav />
    </>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}
