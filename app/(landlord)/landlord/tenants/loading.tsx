export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-3xl animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-32 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-28 bg-muted rounded-lg" />
      </div>

      <div className="card-modern overflow-hidden">
        <div className="divide-y divide-border">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="list-row">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
                <div>
                  <div className="h-4 w-32 bg-muted rounded-lg mb-2" />
                  <div className="h-3 w-40 bg-muted rounded-md mb-1.5" />
                  <div className="h-3 w-36 bg-muted rounded-md" />
                </div>
              </div>
              <div className="h-8 w-20 bg-muted rounded-xl flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
