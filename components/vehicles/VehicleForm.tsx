'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera } from 'lucide-react'
import { vehicleSchema, type VehicleFormValues } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormValues>
  onSubmit: (values: VehicleFormValues) => void
  loading?: boolean
  submitLabel?: string
}

export default function VehicleForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Save Vehicle',
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: 'motorcycle',
      year: new Date().getFullYear(),
      currentMileage: 0,
      ...defaultValues,
    },
  })

  const vehicleType = watch('type')
  const photo = watch('photo')
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setValue('photo', ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(['motorcycle', 'car'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('type', t)}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                vehicleType === t
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <span className="text-xl">{t === 'motorcycle' ? '🏍️' : '🚗'}</span>
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optional)</label>
        <div
          className="relative w-full h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-gray-300 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Vehicle" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Camera size={24} />
              <span className="text-xs">Tap to add photo</span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      {/* Brand & Model */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand" error={errors.brand?.message}>
          <input
            {...register('brand')}
            placeholder="Honda"
            className={inputCls(!!errors.brand)}
          />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <input
            {...register('model')}
            placeholder="Wave 125"
            className={inputCls(!!errors.model)}
          />
        </Field>
      </div>

      {/* Year & Plate */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Year" error={errors.year?.message}>
          <input
            {...register('year')}
            type="number"
            placeholder="2022"
            className={inputCls(!!errors.year)}
          />
        </Field>
        <Field label="License Plate" error={errors.licensePlate?.message}>
          <input
            {...register('licensePlate')}
            placeholder="9M-1234"
            className={inputCls(!!errors.licensePlate)}
          />
        </Field>
      </div>

      {/* Color & Mileage */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Color" error={errors.color?.message}>
          <input
            {...register('color')}
            placeholder="Red"
            className={inputCls(!!errors.color)}
          />
        </Field>
        <Field label="Current Mileage (km)" error={errors.currentMileage?.message}>
          <input
            {...register('currentMileage')}
            type="number"
            placeholder="42500"
            className={inputCls(!!errors.currentMileage)}
          />
        </Field>
      </div>

      {/* Purchase Date */}
      <Field label="Purchase Date (optional)" error={errors.purchaseDate?.message}>
        <input
          {...register('purchaseDate')}
          type="date"
          className={inputCls(!!errors.purchaseDate)}
        />
      </Field>

      {/* Notes */}
      <Field label="Notes (optional)" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Any extra notes..."
          className={cn(inputCls(!!errors.notes), 'resize-none')}
        />
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
