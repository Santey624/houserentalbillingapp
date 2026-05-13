export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-5xl animate-pulse">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-10 w-36 bg-muted rounded-xl mb-2" />
          <div className="h-4 w-24 bg-muted rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-modern p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
            <div className="h-5 w-32 bg-muted rounded-lg mb-2" />
            <div className="h-4 w-44 bg-muted rounded-md mb-3" />
            <div className="h-3 w-14 bg-muted rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
