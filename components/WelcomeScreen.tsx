import Link from 'next/link'
import Image from 'next/image'
import { Wrench, Wallet, BellRing } from 'lucide-react'

const FEATURES = [
  {
    icon: Wrench,
    title: 'Service log',
    desc: 'Every oil change, repair, and part — recorded.',
  },
  {
    icon: Wallet,
    title: 'Cost tracking',
    desc: 'See what each vehicle really costs you.',
  },
  {
    icon: BellRing,
    title: 'Reminders',
    desc: 'Know when the next service is due.',
  },
]

export default function WelcomeScreen() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 mb-5">
            <Image
              src="/icons/icon-192.png"
              alt="Auto Care"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[#20252B] tracking-tight">Auto Care</h1>
          <p className="text-sm text-[#69737E] mt-1.5 tracking-wider">
            MAINTAIN · TRACK · DRIVE
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E8EB] shadow-[0_1px_3px_rgba(32,37,43,0.06)] p-7">
          <p className="text-sm text-[#69737E] leading-relaxed text-center mb-6">
            Keep your car or motorcycle in top shape — all services, costs, and
            reminders in one place.
          </p>

          <div className="space-y-4 mb-7">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F8F9FA] border border-[#E5E8EB] flex items-center justify-center text-[#20252B] shrink-0">
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#20252B]">{title}</p>
                  <p className="text-xs text-[#69737E] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="block w-full text-center py-3.5 px-5 bg-[#20252B] text-white text-sm font-semibold rounded-xl hover:bg-[#3A424B] transition-all active:scale-[0.98]"
          >
            Get Started
          </Link>

          <p className="text-[10px] text-[#B0B8C2] text-center mt-4">
            Free · Sign in with Google · Your data stays private
          </p>
        </div>
      </div>
    </main>
  )
}
