export default function BlogDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-4 animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-24 bg-slate-200 rounded-full" />
              <div className="h-5 w-16 bg-green-100 rounded-full" />
            </div>
            <div className="h-9 w-4/5 bg-slate-200 rounded" />
            <div className="h-6 w-3/5 bg-slate-200 rounded" />
            <div className="flex gap-3">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
            {/* Verification banner */}
            <div className="h-16 bg-green-50 border border-green-200 rounded-xl" />
            {/* Excerpt */}
            <div className="h-12 bg-slate-100 rounded border-l-4 border-green-400 pl-4" />
            {/* Sections */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-5/6 bg-slate-100 rounded" />
                <div className="h-4 w-4/6 bg-slate-100 rounded" />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 animate-pulse">
            <div className="h-40 bg-navy-700 rounded-xl opacity-60" />
            <div className="h-48 bg-white rounded-xl border border-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
