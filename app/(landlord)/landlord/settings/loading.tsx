export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-2xl animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-32 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-56 bg-muted rounded-lg" />
      </div>

      <div className="space-y-6">
        <div className="card-modern p-6">
          <div className="h-5 w-20 bg-muted rounded-lg mb-5" />
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="h-4 w-28 bg-muted rounded-md mb-2" />
                <div className="h-11 w-full bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="card-modern p-6">
          <div className="h-5 w-36 bg-muted rounded-lg mb-5" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="h-4 w-32 bg-muted rounded-md mb-2" />
                <div className="h-11 w-full bg-muted rounded-xl" />
              </div>
            ))}
          </div>
          <div className="h-4 w-28 bg-muted rounded-md mb-2" />
          <div className="h-20 w-full bg-muted rounded-xl" />
        </div>

        <div className="h-11 w-full bg-muted rounded-xl" />
      </div>
    </div>
  )
}
