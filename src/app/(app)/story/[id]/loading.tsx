// Story skeleton: appears the moment a story is tapped.
export default function LoadingStory() {
  return (
    <div className="animate-pulse lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_340px]" aria-busy="true" aria-label="Loading story">
      <div className="space-y-4">
        <div className="h-8 w-24 rounded-full bg-surface-2" />
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-surface-2" />
          <div className="h-4 w-40 rounded-lg bg-surface-2" />
        </div>
        <div className="h-8 w-full rounded-xl bg-surface-2" />
        <div className="h-8 w-3/4 rounded-xl bg-surface-2" />
        <div className="h-48 rounded-3xl border border-line bg-surface" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 rounded-3xl border border-line bg-surface" />
          <div className="h-40 rounded-3xl bg-surface-2" />
        </div>
      </div>
      <div className="hidden space-y-4 lg:block">
        <div className="h-28 rounded-3xl border border-line bg-surface" />
        <div className="h-64 rounded-3xl border border-line bg-surface" />
      </div>
    </div>
  );
}
