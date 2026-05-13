export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-5xl animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-56 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-44 bg-muted rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card-modern p-5">
            <div className="w-9 h-9 rounded-lg bg-muted mb-3" />
            <div className="h-8 w-10 bg-muted rounded-lg mb-2" />
            <div className="h-3 w-20 bg-muted rounded-md" />
          </div>
        ))}
      </div>

      <div className="card-modern overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="h-6 w-36 bg-muted rounded-lg" />
          <div className="h-9 w-28 bg-muted rounded-xl" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="list-row">
              <div>
                <div className="h-4 w-28 bg-muted rounded-lg mb-2" />
                <div className="h-3 w-36 bg-muted rounded-md" />
              </div>
              <div className="text-right">
                <div className="h-4 w-16 bg-muted rounded-lg mb-2" />
                <div className="h-5 w-14 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
