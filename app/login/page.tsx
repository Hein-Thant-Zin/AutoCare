'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
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
          <h1 className="text-2xl font-bold text-[#20252B] tracking-tight">
            Auto Care
          </h1>
          <p className="text-sm text-[#69737E] mt-1.5 tracking-wider">
            MAINTAIN · TRACK · DRIVE
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E8EB] shadow-[0_1px_3px_rgba(32,37,43,0.06)] p-7">
          <h2 className="text-base font-semibold text-[#20252B] mb-1">Sign in to continue</h2>
          <p className="text-xs text-[#69737E] mb-6 leading-relaxed">
            Your vehicles and maintenance history are securely synced to your account.
          </p>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white border border-[#E5E8EB] rounded-xl text-sm font-semibold text-[#20252B] hover:bg-[#F8F9FA] hover:border-[#20252B] transition-all active:scale-[0.98]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-[10px] text-[#B0B8C2] text-center mt-5 leading-relaxed">
            By signing in, your data is stored securely and privately.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
