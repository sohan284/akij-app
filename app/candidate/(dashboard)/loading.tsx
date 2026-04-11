export default function Loading() {
  return (
    <div className="container mx-auto p-4 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
            <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded-md"></div>
              <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
              <div className="h-10 w-28 bg-slate-300 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
