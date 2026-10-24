// Shown instantly while a page loads, so taps never feel ignored.
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-3 w-40 rounded-full" />
      <div className="skeleton h-14 w-72 max-w-full rounded-2xl" />
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="skeleton h-[340px] rounded-[24px] lg:col-span-8" />
        <div className="skeleton h-[340px] rounded-[24px] lg:col-span-4" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-44 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}
