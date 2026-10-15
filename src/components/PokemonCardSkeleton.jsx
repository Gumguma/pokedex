export default function PokemonCardSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="bg-white rounded-2xl border border-[#e9ebf0] p-4 space-y-4 animate-pulse overflow-hidden"
        >
          <div className="flex justify-between items-center">
            <div className="h-3 w-10 bg-neutral-200 rounded"></div>
            <div className="flex gap-1.5">
              <div className="w-6 h-6 bg-neutral-200 rounded-lg"></div>
              <div className="w-6 h-6 bg-neutral-200 rounded-lg"></div>
              <div className="w-6 h-6 bg-neutral-200 rounded-lg"></div>
            </div>
          </div>

          <div className="h-32 flex items-center justify-center">
            <div className="w-24 h-24 bg-neutral-200 rounded-full"></div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <div className="h-4 w-24 bg-neutral-200 rounded-md"></div>
            <div className="flex gap-1.5">
              <div className="h-4 w-12 bg-neutral-200 rounded-md"></div>
              <div className="h-4 w-12 bg-neutral-200 rounded-md"></div>
            </div>
          </div>

          <div className="h-8 bg-neutral-100 rounded-lg"></div>
        </div>
      ))}
    </>
  );
}
