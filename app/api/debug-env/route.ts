import { NextResponse } from 'next/server'

// Temporary debug endpoint to check env vars are set on Vercel
// Remove after confirming everything works
export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ set' : '❌ MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ set' : '❌ MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ set' : '❌ MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ set' : '❌ MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ set' : '❌ MISSING',
    DIRECT_URL: process.env.DIRECT_URL ? '✅ set' : '❌ MISSING',
    NODE_ENV: process.env.NODE_ENV,
  })
}
