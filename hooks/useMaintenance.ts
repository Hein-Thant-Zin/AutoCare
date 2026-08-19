'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { MaintenanceRecord } from '@/types'
import type { MaintenanceFormValues } from '@/lib/validations'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useMaintenance(vehicleId?: string, adminUserId?: string) {
  const url = adminUserId
    ? `/api/admin/users/${adminUserId}`
    : vehicleId
    ? `/api/maintenance?vehicleId=${vehicleId}`
    : '/api/maintenance'

  const { data, isLoading, error, mutate } = useSWR<
    MaintenanceRecord[] | { maintenanceRecords: MaintenanceRecord[] }
  >(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  const records: MaintenanceRecord[] = adminUserId
    ? ((data as { maintenanceRecords: MaintenanceRecord[] })?.maintenanceRecords ?? [])
    : ((data as MaintenanceRecord[]) ?? [])

  const addRecord = useCallback(async (formData: MaintenanceFormValues): Promise<MaintenanceRecord | null> => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error()
      const record: MaintenanceRecord = await res.json()
      // Optimistically prepend to cache
      mutate((prev: MaintenanceRecord[] | { maintenanceRecords: MaintenanceRecord[] } | undefined) => {
        const list = (prev as MaintenanceRecord[]) ?? []
        return [record, ...list]
      }, false)
      return record
    } catch {
      return null
    }
  }, [mutate])

  const removeRecord = useCallback(async (id: string) => {
    try {
      await fetch(`/api/maintenance/${id}`, { method: 'DELETE' })
      mutate((prev: MaintenanceRecord[] | { maintenanceRecords: MaintenanceRecord[] } | undefined) => {
        const list = (prev as MaintenanceRecord[]) ?? []
        return list.filter((r) => r.id !== id)
      }, false)
    } catch {
      // ignore
    }
  }, [mutate])

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    records,
    loading: isLoading,
    error: error?.message ?? null,
    addRecord,
    removeRecord,
    refresh,
  }
}
