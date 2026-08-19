'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Plus, Trash2 } from 'lucide-react'
import { maintenanceSchema, MAINTENANCE_TYPE_VALUES, type MaintenanceFormValues } from '@/lib/validations'
import { MAINTENANCE_TYPE_LABELS } from '@/types'
import { cn, todayISO, formatCurrency } from '@/lib/utils'
import { getWorkshops } from '@/lib/storage'
import type { Vehicle } from '@/types'

// ─── Line Item ────────────────────────────────────────────────────────────────

interface LineItem {
  type: typeof MAINTENANCE_TYPE_VALUES[number]
  description: string
  partsCost: number
  laborCost: number
}

const emptyItem = (): LineItem => ({
  type: 'engine_oil',
  description: '',
  partsCost: 0,
  laborCost: 0,
})

// ─── Form ─────────────────────────────────────────────────────────────────────

interface MaintenanceFormProps {
  vehicles: Vehicle[]
  defaultVehicleId?: string
  defaultValues?: Partial<MaintenanceFormValues>
  onSubmit: (values: MaintenanceFormValues) => void
  loading?: boolean
  submitLabel?: string
  currency?: string
}

export default function MaintenanceForm({
  vehicles,
  defaultVehicleId,
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Save Record',
  currency = 'MMK',
}: MaintenanceFormProps) {
  const [workshops, setWorkshops] = useState<string[]>([])
  const [receiptPreview, setReceiptPreview] = useState<string | undefined>(defaultValues?.receiptPhoto)
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyItem()])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setWorkshops(getWorkshops()) }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicleId: defaultVehicleId ?? vehicles[0]?.id ?? '',
      date: todayISO(),
      mileage: 0,
      partsCost: 0,
      laborCost: 0,
      totalCost: 0,
      ...defaultValues,
    },
  })

  // Grand totals computed from line items
  const grandParts = lineItems.reduce((s, i) => s + Number(i.partsCost || 0), 0)
  const grandLabor = lineItems.reduce((s, i) => s + Number(i.laborCost || 0), 0)
  const grandTotal = grandParts + grandLabor

  const updateItem = <K extends keyof LineItem>(idx: number, key: K, val: LineItem[K]) => {
    setLineItems((prev) => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item))
  }

  const addItem = () => setLineItems((prev) => [...prev, emptyItem()])

  const removeItem = (idx: number) => {
    if (lineItems.length === 1) return // keep at least one
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setReceiptPreview(result)
      setValue('receiptPhoto', result)
    }
    reader.readAsDataURL(file)
  }

  const handleFormSubmit = (values: MaintenanceFormValues) => {
    onSubmit({
      ...values,
      partsCost: grandParts,
      laborCost: grandLabor,
      totalCost: grandTotal,
      type: lineItems[0].type, // primary type from first item
      items: lineItems.map((item) => ({
        type: item.type,
        description: item.description || undefined,
        partsCost: Number(item.partsCost || 0),
        laborCost: Number(item.laborCost || 0),
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

      {/* Vehicle selector */}
      <Field label="Vehicle" error={errors.vehicleId?.message}>
        <select {...register('vehicleId')} className={selectCls(!!errors.vehicleId)}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} {v.year} — {v.licensePlate}
            </option>
          ))}
        </select>
      </Field>

      {/* Date & Mileage */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" error={errors.date?.message}>
          <input {...register('date')} type="date" className={inputCls(!!errors.date)} />
        </Field>
        <Field label="Mileage (km)" error={errors.mileage?.message}>
          <input
            {...register('mileage')}
            type="number"
            placeholder="42500"
            inputMode="numeric"
            className={inputCls(!!errors.mileage)}
          />
        </Field>
      </div>

      {/* ── Line Items ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Services</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Plus size={13} />
            Add Service
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2.5"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  Service {lineItems.length > 1 ? idx + 1 : ''}
                </span>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors rounded-lg"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Type chips — scrollable */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {MAINTENANCE_TYPE_VALUES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateItem(idx, 'type', t)}
                    className={cn(
                      'px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all shrink-0',
                      item.type === t
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    )}
                  >
                    {MAINTENANCE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              {/* Description */}
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                placeholder="Description (optional)"
                className={inputCls(false)}
              />

              {/* Parts + Labor costs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Parts ({currency})</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={item.partsCost || ''}
                    onChange={(e) => updateItem(idx, 'partsCost', Number(e.target.value))}
                    placeholder="0"
                    className={inputCls(false)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Labor ({currency})</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={item.laborCost || ''}
                    onChange={(e) => updateItem(idx, 'laborCost', Number(e.target.value))}
                    placeholder="0"
                    className={inputCls(false)}
                  />
                </div>
              </div>

              {/* Row subtotal */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(Number(item.partsCost || 0) + Number(item.laborCost || 0), currency)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Grand total */}
        <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-gray-900 text-white">
          <div className="text-xs opacity-70">
            Parts {formatCurrency(grandParts, currency)} · Labor {formatCurrency(grandLabor, currency)}
          </div>
          <div className="text-base font-bold">{formatCurrency(grandTotal, currency)}</div>
        </div>
      </div>
      {/* ─────────────────────────────────────────────────────────── */}

      {/* Workshop */}
      <Field label="Workshop / Mechanic (optional)" error={errors.workshop?.message}>
        <input
          {...register('workshop')}
          list="workshops-list"
          placeholder="e.g. Happy Motors"
          className={inputCls(!!errors.workshop)}
        />
        {workshops.length > 0 && (
          <datalist id="workshops-list">
            {workshops.map((w) => <option key={w} value={w} />)}
          </datalist>
        )}
      </Field>

      {/* Notes */}
      <Field label="Notes (optional)" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Any extra notes..."
          className={cn(inputCls(!!errors.notes), 'resize-none')}
        />
      </Field>

      {/* Next service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Next Service (optional)</label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" error={errors.nextServiceDate?.message}>
            <input {...register('nextServiceDate')} type="date" className={inputCls(!!errors.nextServiceDate)} />
          </Field>
          <Field label="Mileage (km)" error={errors.nextServiceMileage?.message}>
            <input
              {...register('nextServiceMileage')}
              type="number"
              placeholder="45500"
              inputMode="numeric"
              className={inputCls(!!errors.nextServiceMileage)}
            />
          </Field>
        </div>
      </div>

      {/* Receipt photo */}
      <Field label="Receipt Photo (optional)" error={errors.receiptPhoto?.message}>
        <div
          className="relative w-full h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-gray-300 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {receiptPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={receiptPreview} alt="Receipt" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Camera size={22} />
              <span className="text-xs">Tap to add receipt</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleReceiptChange} />
        </div>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full px-3 py-2.5 rounded-xl border bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition',
    hasError ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'
  )
}

function selectCls(hasError: boolean) {
  return cn(inputCls(hasError), 'cursor-pointer')
}
