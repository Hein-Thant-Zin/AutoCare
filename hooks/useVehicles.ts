'use client'

import { useCallback } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import type { Vehicle } from '@/types'
import type { VehicleFormValues } from '@/lib/validations'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useVehicles(adminUserId?: string) {
  const url = adminUserId
    ? `/api/admin/users/${adminUserId}`
    : '/api/vehicles'

  const { data, isLoading, error, mutate } = useSWR<Vehicle[] | { vehicles: Vehicle[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // don't re-fetch if called within 5s
    }
  )

  const vehicles: Vehicle[] = adminUserId
    ? ((data as { vehicles: Vehicle[] })?.vehicles ?? [])
    : ((data as Vehicle[]) ?? [])

  const addVehicle = useCallback(async (formData: VehicleFormValues): Promise<Vehicle | null> => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error()
      const vehicle: Vehicle = await res.json()
      // Optimistically update cache
      mutate((prev: Vehicle[] | { vehicles: Vehicle[] } | undefined) => {
        const list = (prev as Vehicle[]) ?? []
        return [vehicle, ...list]
      }, false)
      return vehicle
    } catch {
      return null
    }
  }, [mutate])

  const editVehicle = useCallback(async (id: string, formData: Partial<VehicleFormValues>): Promise<Vehicle | null> => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error()
      const vehicle: Vehicle = await res.json()
      mutate((prev: Vehicle[] | { vehicles: Vehicle[] } | undefined) => {
        const list = (prev as Vehicle[]) ?? []
        return list.map((v) => (v.id === id ? vehicle : v))
      }, false)
      return vehicle
    } catch {
      return null
    }
  }, [mutate])

  const removeVehicle = useCallback(async (id: string) => {
    try {
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
      mutate((prev: Vehicle[] | { vehicles: Vehicle[] } | undefined) => {
        const list = (prev as Vehicle[]) ?? []
        return list.filter((v) => v.id !== id)
      }, false)
    } catch {
      // ignore
    }
  }, [mutate])

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    vehicles,
    loading: isLoading,
    error: error?.message ?? null,
    addVehicle,
    editVehicle,
    removeVehicle,
    refresh,
  }
}
