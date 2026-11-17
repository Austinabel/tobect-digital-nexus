/** Skeleton shown while a shop page renders. */
export default function ShopLoading() {
  return (
    <div aria-busy="true" aria-label="Loading shop">
      <div className="h-[300px] animate-pulse bg-ink/90" />
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-9">
        <div className="flex gap-2.5 overflow-hidden">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-[92px] w-[96px] shrink-0 animate-pulse rounded-2xl bg-field" />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
          <div className="hidden h-[480px] animate-pulse rounded-2xl bg-field lg:block" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-[3/5] animate-pulse rounded-2xl bg-field" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
