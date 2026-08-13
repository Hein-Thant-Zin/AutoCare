'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import VehicleCard from '@/components/vehicles/VehicleCard'
import { useVehicles } from '@/hooks/useVehicles'
import { useMaintenance } from '@/hooks/useMaintenance'

export default function VehiclesPage() {
  const { vehicles, loading } = useVehicles()
  const { records } = useMaintenance()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <>
      <Header
        title="Vehicles"
        right={
          <Link
            href="/vehicles/new"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add
          </Link>
        }
      />

      <PageShell className="space-y-3">
        {loading ? (
          <LoadingCards />
        ) : vehicles.length === 0 ? (
          <EmptyState />
        ) : (
          vehicles.map((vehicle) => {
            const vehicleRecords = records
              .filter((r) => r.vehicleId === vehicle.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                lastRecord={vehicleRecords[0]}
              />
            )
          })
        )}
      </PageShell>

      <BottomNav />
    </>
  )
}

function LoadingCards() {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
      ))}
    </>
  )
}

function EmptyState() {
  return (
    <div className="pt-10 flex flex-col items-center text-center">
      <p className="text-5xl mb-4">🏍️</p>
      <p className="text-base font-semibold text-gray-800">No vehicles yet</p>
      <p className="text-sm text-gray-400 mt-1 mb-6 max-w-xs">
        Add your motorcycle or car to start tracking maintenance history
      </p>
      <Link
        href="/vehicles/new"
        className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-gray-700 transition-colors"
      >
        <Plus size={16} />
        Add First Vehicle
      </Link>
    </div>
  )
}
