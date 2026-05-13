export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-2xl animate-pulse">
      <div className="h-4 w-20 bg-muted rounded-md mb-6" />
      <div className="mb-8">
        <div className="h-10 w-48 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-44 bg-muted rounded-lg" />
      </div>

      <div className="card-modern p-6 mb-5">
        <div className="h-5 w-40 bg-muted rounded-lg mb-4" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 w-full bg-muted rounded-xl" />
          ))}
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="h-5 w-44 bg-muted rounded-lg mb-4" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-11 w-full bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
