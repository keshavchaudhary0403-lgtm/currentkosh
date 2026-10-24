// Story skeleton: appears the moment a story is tapped.
export default function LoadingStory() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10" aria-busy="true" aria-label="Loading story">
      <div className="space-y-5">
        <div className="skeleton h-11 w-28 rounded-full" />
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-44 rounded-full" />
          <div className="skeleton h-4 w-32 rounded-full" />
        </div>
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="skeleton h-12 w-2/3 rounded-2xl" />
        <div className="space-y-2.5 pt-4">
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-11/12 rounded-full" />
          <div className="skeleton h-4 w-4/5 rounded-full" />
        </div>
        <div className="skeleton h-56 rounded-[24px]" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="skeleton h-40 rounded-[24px]" />
          <div className="skeleton h-40 rounded-[24px]" />
        </div>
      </div>
      <div className="hidden space-y-4 lg:block">
        <div className="skeleton h-32 rounded-[24px]" />
        <div className="skeleton h-72 rounded-[24px]" />
      </div>
    </div>
  );
}
