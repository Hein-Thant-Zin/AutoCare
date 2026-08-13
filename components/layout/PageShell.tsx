import { cn } from '@/lib/utils'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cn('max-w-lg mx-auto px-4 py-4', className)}>
      {children}
    </main>
  )
}
