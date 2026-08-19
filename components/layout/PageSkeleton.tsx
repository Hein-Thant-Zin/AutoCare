import Header from '@/components/layout/Header'
import PageShell from '@/components/layout/PageShell'
import BottomNav from '@/components/layout/BottomNav'

/**
 * Generic pulsing skeleton shown while page data is loading.
 * Prevents blank white flash when navigating between tabs.
 */
export default function PageSkeleton({ title = '' }: { title?: string }) {
  return (
    <>
      <Header title={title} />
      <PageShell className="space-y-4">
        {/* Card skeletons */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
            <div className="h-2 bg-gray-50 rounded-full" />
          </div>
        ))}
      </PageShell>
      <BottomNav />
    </>
  )
}
