'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import VehicleForm from '@/components/vehicles/VehicleForm'
import { useVehicles } from '@/hooks/useVehicles'
import type { VehicleFormValues } from '@/lib/validations'

export default function EditVehiclePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { vehicles, editVehicle, loading } = useVehicles()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => setMounted(true), [])

  const vehicle = useMemo(() => vehicles.find((v) => v.id === id), [vehicles, id])

  if (!mounted) return null
  if (!loading && !vehicle) {
    return (
      <>
        <Header title="Not Found" showBack />
        <PageShell>
          <p className="text-sm text-[#69737E] text-center py-12">Vehicle not found.</p>
        </PageShell>
        <BottomNav />
      </>
    )
  }
  if (!vehicle) return null

  const handleSubmit = async (values: VehicleFormValues) => {
    setSaving(true)
    await editVehicle(id, values)
    setSaving(false)
    router.push(`/vehicles/${id}`)
  }

  return (
    <>
      <Header title="Edit Vehicle" showBack />
      <PageShell>
        <VehicleForm
          defaultValues={{
            type: vehicle.type,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            licensePlate: vehicle.licensePlate,
            color: vehicle.color,
            currentMileage: vehicle.currentMileage,
            purchaseDate: vehicle.purchaseDate,
            notes: vehicle.notes,
            photo: vehicle.photo,
          }}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Save Changes"
        />
      </PageShell>
      <BottomNav />
    </>
  )
}
