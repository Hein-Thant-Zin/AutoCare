'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera } from 'lucide-react'
import { maintenanceSchema, MAINTENANCE_TYPE_VALUES, type MaintenanceFormValues } from '@/lib/validations'
import { MAINTENANCE_TYPE_LABELS } from '@/types'
import { cn, todayISO } from '@/lib/utils'
import { getWorkshops } from '@/lib/storage'
import type { Vehicle } from '@/types'

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
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setWorkshops(getWorkshops())
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicleId: defaultVehicleId ?? vehicles[0]?.id ?? '',
      date: todayISO(),
      mileage: 0,
      type: 'engine_oil',
      partsCost: 0,
      laborCost: 0,
      totalCost: 0,
      ...defaultValues,
    },
  })

  const selectedType = watch('type')
  const partsCost = watch('partsCost') ?? 0
  const laborCost = watch('laborCost') ?? 0

  // Auto-calculate total
  useEffect(() => {
    setValue('totalCost', Number(partsCost) + Number(laborCost))
  }, [partsCost, laborCost, setValue])

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <input
            {...register('date')}
            type="date"
            className={inputCls(!!errors.date)}
          />
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

      {/* Maintenance type chips */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="flex flex-wrap gap-2">
          {MAINTENANCE_TYPE_VALUES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('type', t)}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                selectedType === t
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {MAINTENANCE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
      </div>

      {/* Description */}
      <Field label="Description (optional)" error={errors.description?.message}>
        <input
          {...register('description')}
          placeholder="e.g. Changed engine oil + filter"
          className={inputCls(!!errors.description)}
        />
      </Field>

      {/* Parts replaced */}
      <Field label="Parts Replaced (optional)" error={errors.partsReplaced?.message}>
        <input
          {...register('partsReplaced')}
          placeholder="e.g. Oil filter, air filter"
          className={inputCls(!!errors.partsReplaced)}
        />
      </Field>

      {/* Costs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cost ({currency})
        </label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Parts" error={errors.partsCost?.message}>
            <input
              {...register('partsCost')}
              type="number"
              placeholder="0"
              inputMode="numeric"
              className={inputCls(!!errors.partsCost)}
            />
          </Field>
          <Field label="Labor" error={errors.laborCost?.message}>
            <input
              {...register('laborCost')}
              type="number"
              placeholder="0"
              inputMode="numeric"
              className={inputCls(!!errors.laborCost)}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-base font-bold text-gray-900">
            {(Number(partsCost) + Number(laborCost)).toLocaleString()} {currency}
          </span>
        </div>
      </div>

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
            {workshops.map((w) => (
              <option key={w} value={w} />
            ))}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Next Service (optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" error={errors.nextServiceDate?.message}>
            <input
              {...register('nextServiceDate')}
              type="date"
              className={inputCls(!!errors.nextServiceDate)}
            />
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
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReceiptChange}
          />
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

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
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
