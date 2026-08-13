'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import MaintenanceForm from '@/components/maintenance/MaintenanceForm'
import { useVehicles } from '@/hooks/useVehicles'
import { useMaintenance } from '@/hooks/useMaintenance'
import { useSettings } from '@/hooks/useSettings'
import type { MaintenanceFormValues } from '@/lib/validations'

function NewMaintenanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicleId') ?? undefined

  const { vehicles } = useVehicles()
  const { addRecord } = useMaintenance()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: MaintenanceFormValues) => {
    setLoading(true)
    try {
      addRecord(values)
      if (vehicleId) {
        router.push(`/vehicles/${vehicleId}`)
      } else {
        router.push('/maintenance')
      }
    } finally {
      setLoading(false)
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-3xl mb-3">🚗</p>
        <p className="text-sm font-semibold text-gray-700">No vehicles found</p>
        <p className="text-xs text-gray-400 mt-1 mb-4">Add a vehicle first before recording maintenance</p>
        <a href="/vehicles/new" className="text-sm font-medium text-gray-900 underline">
          Add a vehicle →
        </a>
      </div>
    )
  }

  return (
    <MaintenanceForm
      vehicles={vehicles}
      defaultVehicleId={vehicleId}
      onSubmit={handleSubmit}
      loading={loading}
      currency={settings.currency}
    />
  )
}

export default function NewMaintenancePage() {
  return (
    <>
      <Header title="Add Maintenance" showBack />
      <PageShell>
        <Suspense fallback={<div className="h-40 bg-gray-100 rounded-xl animate-pulse" />}>
          <NewMaintenanceContent />
        </Suspense>
      </PageShell>
      <BottomNav />
    </>
  )
}
