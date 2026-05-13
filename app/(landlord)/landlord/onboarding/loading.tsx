export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-2xl animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-36 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-52 bg-muted rounded-lg" />
      </div>

      <div className="card-modern p-6">
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-muted rounded-md mb-2" />
              <div className="h-11 w-full bg-muted rounded-xl" />
            </div>
          ))}
          <div className="h-11 w-full bg-muted rounded-xl mt-2" />
        </div>
      </div>
    </div>
  )
}
