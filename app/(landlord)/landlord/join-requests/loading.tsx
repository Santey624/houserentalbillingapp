export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-3xl animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-40 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-20 bg-muted rounded-lg" />
      </div>

      <div className="h-6 w-24 bg-muted rounded-lg mb-4" />
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="card-modern p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
                <div>
                  <div className="h-4 w-28 bg-muted rounded-lg mb-2" />
                  <div className="h-3 w-36 bg-muted rounded-md" />
                </div>
              </div>
              <div className="h-3 w-20 bg-muted rounded-md" />
            </div>
            <div className="h-4 w-48 bg-muted rounded-md mb-4" />
            <div className="flex gap-3 pt-4 border-t border-border">
              <div className="h-8 w-20 bg-muted rounded-xl" />
              <div className="h-8 w-16 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
