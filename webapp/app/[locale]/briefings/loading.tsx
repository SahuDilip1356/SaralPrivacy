// This file renders INSTANTLY from CDN (static) while page.tsx fetches data.
// Users see skeleton cards in <100ms instead of a blank screen for 15-20s.

export default function BriefingsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero skeleton */}
        <div className="bg-navy-700 rounded-2xl p-8 sm:p-12 mb-10 animate-pulse">
          <div className="h-4 w-24 bg-navy-600 rounded mb-4" />
          <div className="h-8 w-2/3 bg-navy-600 rounded mb-3" />
          <div className="h-4 w-1/2 bg-navy-600 rounded mb-6" />
          <div className="h-10 w-40 bg-green-500/40 rounded-lg" />
        </div>

        {/* Category filter skeleton */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {[80, 120, 90, 110, 80, 100, 90].map((w, i) => (
            <div key={i} className="animate-pulse h-8 rounded-full bg-slate-200 shrink-0" style={{ width: w }} />
          ))}
        </div>

        {/* Card grid skeleton — 6 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-3 w-20 bg-slate-200 rounded mb-4" />
              <div className="h-5 w-full bg-slate-200 rounded mb-2" />
              <div className="h-5 w-4/5 bg-slate-200 rounded mb-3" />
              <div className="h-3 w-full bg-slate-100 rounded mb-1" />
              <div className="h-3 w-3/4 bg-slate-100 rounded mb-5" />
              <div className="h-5 w-24 bg-slate-100 rounded mb-5" />
              <div className="border-t border-slate-100 pt-4 flex justify-between">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-10 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
