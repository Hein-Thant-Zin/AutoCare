import type { AppSettings } from '@/types'

const SETTINGS_KEY = 'autocare_settings'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getSettings(): AppSettings {
  if (!isBrowser()) return { currency: 'MMK', distanceUnit: 'km' }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { currency: 'MMK', distanceUnit: 'km' }
  } catch {
    return { currency: 'MMK', distanceUnit: 'km' }
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  return next
}
