export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-3xl animate-pulse">
      <div className="h-4 w-28 bg-muted rounded-md mb-6" />

      <div className="mb-8">
        <div className="h-10 w-40 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-32 bg-muted rounded-lg" />
      </div>

      <div className="card-modern p-6 mb-5">
        <div className="h-5 w-32 bg-muted rounded-lg mb-4" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
          <div>
            <div className="h-4 w-32 bg-muted rounded-lg mb-2" />
            <div className="h-3 w-40 bg-muted rounded-md" />
          </div>
        </div>
      </div>

      <div className="card-modern overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="h-5 w-20 bg-muted rounded-lg" />
          <div className="h-8 w-28 bg-muted rounded-xl" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="list-row">
              <div>
                <div className="h-4 w-28 bg-muted rounded-lg mb-2" />
                <div className="h-3 w-20 bg-muted rounded-md" />
              </div>
              <div className="text-right">
                <div className="h-4 w-16 bg-muted rounded-lg mb-2 ml-auto" />
                <div className="h-5 w-14 bg-muted rounded-full ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
