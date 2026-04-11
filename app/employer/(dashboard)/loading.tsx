export default function Loading() {
  return (
    <div className="container mx-auto p-4 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-12 w-48 bg-blue-100 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
              <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
                <div className="h-5 w-16 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-20 bg-slate-100 rounded ml-auto"></div>
                <div className="h-5 w-16 bg-slate-200 rounded ml-auto"></div>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-4"></div>
            <div className="pt-4 flex gap-2">
              <div className="h-10 flex-1 bg-slate-300 rounded-xl"></div>
              <div className="h-10 flex-1 bg-blue-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
