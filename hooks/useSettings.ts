'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AppSettings } from '@/types'
import { getSettings, saveSettings } from '@/lib/storage'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'MMK',
    distanceUnit: 'km',
  })

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    const updated = saveSettings(patch)
    setSettings(updated)
  }, [])

  return { settings, updateSettings }
}
