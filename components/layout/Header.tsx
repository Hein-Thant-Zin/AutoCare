'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ArrowLeft, LogOut, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showLogo?: boolean
  right?: React.ReactNode
}

export default function Header({
  title,
  showBack = false,
  showLogo = false,
  right,
}: HeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  const isAdmin = session?.user?.role === 'admin'

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E8EB] safe-area-pt">
      <div className="max-w-lg mx-auto flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 -ml-1 rounded-lg text-[#69737E] hover:text-[#20252B] hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        )}

        {showLogo ? (
          <div className="flex items-center gap-2 flex-1">
            <Image
              src="/icons/icon-192.png"
              alt="Auto Care"
              width={26}
              height={26}
              className="object-contain rounded-md"
            />
            <span className="text-sm font-bold text-[#20252B] tracking-tight">
              Auto Care
            </span>
            {isAdmin && (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-[#4F6074] bg-[#EEF1F4] px-2 py-0.5 rounded-full uppercase tracking-wider ml-0.5">
                <Shield size={9} />
                Admin
              </span>
            )}
          </div>
        ) : (
          <h1 className="flex-1 text-[15px] font-semibold text-[#20252B] tracking-tight truncate">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {right && <div className="shrink-0">{right}</div>}

          {/* User avatar */}
          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border-2 border-[#E5E8EB] hover:border-[#20252B] transition-colors shrink-0"
                aria-label="User menu"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? 'User'}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#20252B] flex items-center justify-center text-white text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-10 z-50 w-52 bg-white border border-[#E5E8EB] rounded-xl shadow-card-hover overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[#E5E8EB]">
                      <p className="text-xs font-semibold text-[#20252B] truncate">
                        {session.user.name}
                      </p>
                      <p className="text-[10px] text-[#69737E] truncate mt-0.5">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Admin panel link */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-[#20252B] hover:bg-[#F8F9FA] transition-colors border-b border-[#E5E8EB]"
                      >
                        <Shield size={14} strokeWidth={1.8} />
                        Admin Panel
                      </Link>
                    )}

                    {/* Sign out */}
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-[#C45B5B] hover:bg-[#FDF2F2] transition-colors"
                    >
                      <LogOut size={14} strokeWidth={1.8} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
