// Instant skeleton for briefing detail page — renders from CDN while data loads

export default function BriefingDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content skeleton */}
          <div className="lg:col-span-2 animate-pulse">
            {/* Back link */}
            <div className="h-4 w-36 bg-slate-200 rounded mb-6" />

            {/* Header card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
              <div className="h-7 w-full bg-slate-200 rounded mb-2" />
              <div className="h-7 w-4/5 bg-slate-200 rounded mb-5" />
              <div className="flex gap-4">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Hook block */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-4">
              <div className="h-5 w-3/4 bg-red-100 rounded mb-2" />
              <div className="h-4 w-2/3 bg-red-100 rounded" />
            </div>

            {/* 4-card grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {["bg-blue-50","bg-amber-50","bg-green-50","bg-purple-50"].map((bg, i) => (
                <div key={i} className={`${bg} rounded-xl p-4`}>
                  <div className="h-6 w-6 bg-white/60 rounded mb-2" />
                  <div className="h-3 w-20 bg-white/60 rounded mb-2" />
                  <div className="h-4 w-full bg-white/60 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-white/60 rounded" />
                </div>
              ))}
            </div>

            {/* Explainer */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <div className="h-5 w-28 bg-slate-200 rounded mb-4" />
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 mb-3">
                  <div className="h-6 w-6 bg-slate-100 rounded shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-full bg-slate-100 rounded mb-1" />
                    <div className="h-4 w-4/5 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Action block */}
            <div className="bg-navy-700 rounded-xl p-6 mb-4">
              <div className="h-5 w-36 bg-navy-600 rounded mb-4" />
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 mb-3">
                  <div className="h-6 w-6 rounded-full border border-green-400/40 shrink-0" />
                  <div className="h-4 w-full bg-navy-600 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-5 animate-pulse">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
              {[1,2,3].map(i => (
                <div key={i} className="mb-4">
                  <div className="h-3 w-16 bg-slate-100 rounded mb-1" />
                  <div className="h-4 w-full bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <div className="h-4 w-40 bg-green-100 rounded mb-2" />
              <div className="h-3 w-full bg-green-100 rounded mb-4" />
              <div className="h-9 w-full bg-green-200 rounded-lg" />
            </div>
            <div className="bg-navy-700 rounded-xl p-5">
              <div className="h-4 w-40 bg-navy-600 rounded mb-2" />
              <div className="h-3 w-full bg-navy-600 rounded mb-4" />
              <div className="h-9 w-full bg-navy-600 rounded-lg" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
