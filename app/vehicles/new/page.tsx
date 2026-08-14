'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import VehicleForm from '@/components/vehicles/VehicleForm'
import { useVehicles } from '@/hooks/useVehicles'
import type { VehicleFormValues } from '@/lib/validations'

export default function NewVehiclePage() {
  const router = useRouter()
  const { addVehicle } = useVehicles()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: VehicleFormValues) => {
    setLoading(true)
    const vehicle = await addVehicle(values)
    setLoading(false)
    if (vehicle) {
      router.push(`/vehicles/${vehicle.id}`)
    }
  }

  return (
    <>
      <Header title="Add Vehicle" showBack />
      <PageShell>
        <VehicleForm onSubmit={handleSubmit} loading={loading} submitLabel="Add Vehicle" />
      </PageShell>
      <BottomNav />
    </>
  )
}
