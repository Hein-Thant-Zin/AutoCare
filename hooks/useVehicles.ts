'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Vehicle } from '@/types'
import type { VehicleFormValues } from '@/lib/validations'

export function useVehicles(adminUserId?: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = adminUserId
    ? `/api/admin/users/${adminUserId}`
    : '/api/vehicles'

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const url = adminUserId ? `${baseUrl}` : '/api/vehicles'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load vehicles')
      const data = adminUserId ? (await res.json()).vehicles : await res.json()
      setVehicles(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [baseUrl, adminUserId])

  useEffect(() => { refresh() }, [refresh])

  const addVehicle = useCallback(async (data: VehicleFormValues): Promise<Vehicle | null> => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create vehicle')
      const vehicle: Vehicle = await res.json()
      setVehicles((prev) => [vehicle, ...prev])
      return vehicle
    } catch {
      return null
    }
  }, [])

  const editVehicle = useCallback(async (id: string, data: Partial<VehicleFormValues>): Promise<Vehicle | null> => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update vehicle')
      const vehicle: Vehicle = await res.json()
      setVehicles((prev) => prev.map((v) => (v.id === id ? vehicle : v)))
      return vehicle
    } catch {
      return null
    }
  }, [])

  const removeVehicle = useCallback(async (id: string) => {
    try {
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } catch {
      // ignore
    }
  }, [])

  return { vehicles, loading, error, addVehicle, editVehicle, removeVehicle, refresh }
}
