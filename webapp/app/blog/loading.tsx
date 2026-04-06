export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero skeleton */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-5 w-32 bg-navy-600 rounded-full mb-4 animate-pulse" />
          <div className="h-10 w-96 bg-navy-600 rounded-lg mb-3 animate-pulse" />
          <div className="h-5 w-2/3 bg-navy-600 rounded animate-pulse" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3">
            {[100, 120, 150, 110, 130, 140].map((w, i) => (
              <div key={i} className={`h-7 w-${w} bg-slate-100 rounded-full animate-pulse shrink-0`} style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-4 w-24 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-5 w-24 bg-slate-200 rounded-full mb-3" />
              <div className="h-6 w-full bg-slate-200 rounded mb-2" />
              <div className="h-4 w-5/6 bg-slate-100 rounded mb-1" />
              <div className="h-4 w-4/6 bg-slate-100 rounded mb-4" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-5 w-16 bg-green-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
