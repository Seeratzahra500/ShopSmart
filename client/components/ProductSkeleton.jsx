export default function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white animate-pulse">
      {/* Image area */}
      <div className="aspect-square bg-gray-200 w-full" />

      {/* Text bars */}
      <div className="p-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
        <div className="h-5 bg-gray-200 rounded-full w-1/3 mt-1" />
      </div>

      {/* Button placeholder */}
      <div className="px-6 pb-6">
        <div className="h-10 bg-gray-200 rounded-full w-full" />
      </div>
    </div>
  );
}
