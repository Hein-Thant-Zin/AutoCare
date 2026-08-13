'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Vehicle } from '@/types'
import {
  deleteVehicle,
  getVehicleById,
  getVehicles,
  saveVehicle,
  updateVehicle,
} from '@/lib/storage'
import type { VehicleFormValues } from '@/lib/validations'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setVehicles(getVehicles())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addVehicle = useCallback(
    (data: VehicleFormValues): Vehicle => {
      const v = saveVehicle(data)
      refresh()
      return v
    },
    [refresh]
  )

  const editVehicle = useCallback(
    (id: string, data: Partial<VehicleFormValues>): Vehicle | null => {
      const v = updateVehicle(id, data)
      refresh()
      return v
    },
    [refresh]
  )

  const removeVehicle = useCallback(
    (id: string) => {
      deleteVehicle(id)
      refresh()
    },
    [refresh]
  )

  const getVehicle = useCallback((id: string): Vehicle | undefined => {
    return getVehicleById(id)
  }, [])

  return { vehicles, loading, addVehicle, editVehicle, removeVehicle, getVehicle, refresh }
}
