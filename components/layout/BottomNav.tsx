'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, LayoutDashboard, PenLine, Settings, TrendingUp, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Vehicles', icon: Car },
  { href: '/maintenance', label: 'History', icon: Wrench },
  { href: '/costs', label: 'Costs', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Spacer so content doesn't hide behind nav */}
      <div className="h-20" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-1 relative">

          {/* Left 2 tabs */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <NavTab key={item.href} href={item.href} label={item.label} icon={<Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />} isActive={isActive} />
            )
          })}

          {/* FAB (center) */}
          <Link
            href="/maintenance/new"
            className="flex items-center justify-center w-13 h-13 w-[52px] h-[52px] rounded-full bg-gray-900 text-white shadow-lg -mt-5 shrink-0 hover:bg-gray-700 transition-colors"
            aria-label="Add maintenance record"
          >
            <PenLine size={21} />
          </Link>

          {/* Right 3 tabs */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <NavTab key={item.href} href={item.href} label={item.label} icon={<Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />} isActive={isActive} />
            )
          })}
        </div>
      </nav>
    </>
  )
}

function NavTab({
  href,
  label,
  icon,
  isActive,
}: {
  href: string
  label: string
  icon: React.ReactNode
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[44px]',
        isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
      )}
    >
      {icon}
      <span className="text-[9px] font-medium leading-tight">{label}</span>
    </Link>
  )
}
