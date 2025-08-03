"use client";

export function AddressSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <div className="h-8 w-16 bg-gray-200 rounded-xl"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}