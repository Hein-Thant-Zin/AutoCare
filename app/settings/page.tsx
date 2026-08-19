'use client'

import { useEffect, useRef, useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import PageSkeleton from '@/components/layout/PageSkeleton'
import PageShell from '@/components/layout/PageShell'
import { useSettings } from '@/hooks/useSettings'
import { clearAllData, exportData, importData } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <PageSkeleton />

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `autocare-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importData(ev.target?.result as string)
        setImportSuccess(true)
        setImportError('')
        setTimeout(() => setImportSuccess(false), 3000)
      } catch {
        setImportError('Invalid backup file. Please use a valid AutoCare export.')
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearAllData()
    setConfirmClear(false)
    window.location.reload()
  }

  return (
    <>
      <Header title="Settings" />

      <PageShell className="space-y-6">
        {/* Currency */}
        <Section title="Preferences">
          <SettingRow label="Currency">
            <select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
            >
              {['MMK', 'USD', 'EUR', 'THB', 'SGD', 'MYR', 'IDR', 'PHP', 'VND'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </SettingRow>
          <SettingRow label="Distance Unit">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['km', 'mi'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => updateSettings({ distanceUnit: u })}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium transition-colors',
                    settings.distanceUnit === u
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* Data */}
        <Section title="Data">
          <button
            onClick={handleExport}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📤 Export Data (JSON)
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📥 Import Data (JSON)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />

          {importSuccess && (
            <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
              ✓ Data imported successfully. Refresh the page to see updates.
            </p>
          )}
          {importError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {importError}
            </p>
          )}
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <button
            onClick={handleClearData}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
              confirmClear
                ? 'bg-red-500 text-white border-red-500'
                : 'border-red-100 text-red-500 hover:bg-red-50 bg-white'
            )}
          >
            {confirmClear ? '⚠️ Tap again to confirm — all data will be deleted!' : '🗑️ Clear All Data'}
          </button>
          {confirmClear && (
            <button
              onClick={() => setConfirmClear(false)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              Cancel
            </button>
          )}
        </Section>

        {/* About */}
        <Section title="About">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 space-y-1">
            <InfoRow label="App" value="AutoCare" />
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Storage" value="Local (offline-first)" />
          </div>
        </Section>
      </PageShell>

      <BottomNav />
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </section>
  )
}

function SettingRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-gray-600 font-medium">{value}</span>
    </div>
  )
}
