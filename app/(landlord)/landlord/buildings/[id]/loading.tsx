export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-4xl animate-pulse">
      <div className="h-4 w-28 bg-muted rounded-md mb-6" />

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-10 w-48 bg-muted rounded-xl mb-2" />
            <div className="h-4 w-36 bg-muted rounded-lg" />
          </div>
          <div className="h-9 w-28 bg-muted rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-modern p-5">
            <div className="h-5 w-16 bg-muted rounded-lg mb-3" />
            <div className="h-4 w-20 bg-muted rounded-md mb-2" />
            <div className="h-3 w-12 bg-muted rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
