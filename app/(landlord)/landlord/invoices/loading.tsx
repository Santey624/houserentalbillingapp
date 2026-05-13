export default function Loading() {
  return (
    <div className="p-5 sm:p-8 max-w-4xl animate-pulse">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-10 w-36 bg-muted rounded-xl mb-2" />
          <div className="h-4 w-24 bg-muted rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-xl" />
      </div>

      <div className="flex gap-2 mb-6">
        {[48, 40, 52, 40, 44].map((w, i) => (
          <div key={i} className={`h-7 w-${w < 50 ? '[40px]' : '[52px]'} bg-muted rounded-full`} style={{ width: w }} />
        ))}
      </div>

      <div className="card-modern overflow-hidden">
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="list-row">
              <div>
                <div className="h-4 w-28 bg-muted rounded-lg mb-2" />
                <div className="h-3 w-40 bg-muted rounded-md" />
              </div>
              <div className="text-right">
                <div className="h-4 w-20 bg-muted rounded-lg mb-2 ml-auto" />
                <div className="h-5 w-16 bg-muted rounded-full ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
