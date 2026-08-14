'use client'

import { useCallback, useEffect, useState } from 'react'
import type { MaintenanceRecord } from '@/types'
import type { MaintenanceFormValues } from '@/lib/validations'

export function useMaintenance(vehicleId?: string, adminUserId?: string) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      let url: string
      if (adminUserId) {
        url = `/api/admin/users/${adminUserId}`
      } else {
        url = vehicleId ? `/api/maintenance?vehicleId=${vehicleId}` : '/api/maintenance'
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load records')
      const data = adminUserId ? (await res.json()).maintenanceRecords : await res.json()
      setRecords(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [vehicleId, adminUserId])

  useEffect(() => { refresh() }, [refresh])

  const addRecord = useCallback(async (data: MaintenanceFormValues): Promise<MaintenanceRecord | null> => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create record')
      const record: MaintenanceRecord = await res.json()
      setRecords((prev) => [record, ...prev])
      return record
    } catch {
      return null
    }
  }, [])

  const removeRecord = useCallback(async (id: string) => {
    try {
      await fetch(`/api/maintenance/${id}`, { method: 'DELETE' })
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // ignore
    }
  }, [])

  return { records, loading, error, addRecord, removeRecord, refresh }
}
