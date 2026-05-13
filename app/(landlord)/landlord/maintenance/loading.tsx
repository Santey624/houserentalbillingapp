export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-3xl animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-36 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-32 bg-muted rounded-lg" />
      </div>

      <div className="h-6 w-24 bg-muted rounded-lg mb-4" />
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="card-modern p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-5 w-48 bg-muted rounded-lg mb-2" />
                <div className="h-3 w-32 bg-muted rounded-md" />
              </div>
              <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-4 w-full bg-muted rounded-md mb-2" />
            <div className="h-4 w-3/4 bg-muted rounded-md mb-4" />
            <div className="flex gap-2 pt-4 border-t border-border">
              <div className="h-8 w-24 bg-muted rounded-xl" />
              <div className="h-8 w-24 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
