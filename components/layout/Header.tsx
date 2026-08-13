'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  showBack?: boolean
  right?: React.ReactNode
}

export default function Header({ title, showBack = false, right }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 safe-area-pt">
      <div className="max-w-lg mx-auto flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 -ml-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="flex-1 text-base font-semibold text-gray-900 truncate">
          {title}
        </h1>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  )
}
