export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
