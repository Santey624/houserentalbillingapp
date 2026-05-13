export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-2xl animate-pulse">
      <div className="h-4 w-20 bg-muted rounded-md mb-6" />

      <div className="mb-8">
        <div className="h-10 w-48 bg-muted rounded-xl mb-2" />
        <div className="h-4 w-32 bg-muted rounded-lg" />
      </div>

      <div className="card-modern overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="h-5 w-32 bg-muted rounded-lg" />
          <div className="h-8 w-24 bg-muted rounded-xl" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center px-6 py-3">
              <div className="h-4 w-28 bg-muted rounded-md" />
              <div className="h-4 w-20 bg-muted rounded-md" />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-between">
          <div className="h-5 w-16 bg-muted rounded-lg" />
          <div className="h-5 w-24 bg-muted rounded-lg" />
        </div>
      </div>

      <div className="card-modern p-6">
        <div className="h-5 w-36 bg-muted rounded-lg mb-4" />
        <div className="h-4 w-full bg-muted rounded-md mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded-md mb-5" />
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-muted rounded-xl" />
          <div className="h-10 flex-1 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  )
}
