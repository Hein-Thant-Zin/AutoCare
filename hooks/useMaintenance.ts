'use client'

import { useCallback, useEffect, useState } from 'react'
import type { MaintenanceRecord } from '@/types'
import {
  deleteMaintenance,
  getMaintenanceRecords,
  getRecordsForVehicle,
  saveMaintenance,
  updateMaintenance,
} from '@/lib/storage'
import type { MaintenanceFormValues } from '@/lib/validations'

export function useMaintenance(vehicleId?: string) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const all = vehicleId
      ? getRecordsForVehicle(vehicleId)
      : getMaintenanceRecords().sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    setRecords(all)
    setLoading(false)
  }, [vehicleId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addRecord = useCallback(
    (data: MaintenanceFormValues): MaintenanceRecord => {
      const record = saveMaintenance({
        ...data,
        totalCost: (data.partsCost ?? 0) + (data.laborCost ?? 0),
        partsCost: data.partsCost ?? 0,
        laborCost: data.laborCost ?? 0,
      })
      refresh()
      return record
    },
    [refresh]
  )

  const editRecord = useCallback(
    (id: string, data: Partial<MaintenanceFormValues>): MaintenanceRecord | null => {
      const r = updateMaintenance(id, data)
      refresh()
      return r
    },
    [refresh]
  )

  const removeRecord = useCallback(
    (id: string) => {
      deleteMaintenance(id)
      refresh()
    },
    [refresh]
  )

  return { records, loading, addRecord, editRecord, removeRecord, refresh }
}
