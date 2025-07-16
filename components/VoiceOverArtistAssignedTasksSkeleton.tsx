import React from "react";

const VoiceOverArtistAssignedTasksSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section Skeleton */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff4e00]/5 to-blue-500/5" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#ff4e00] to-orange-600 rounded-xl shadow-lg w-12 h-12" />
                  <div>
                    <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-64 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <div className="h-12 w-full bg-gray-100 rounded-xl" />
                </div>
                <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-12 w-32 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 rounded-xl p-3 w-12 h-12" />
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-7 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Tasks Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-300" />
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl shadow-sm bg-gray-100 w-8 h-8" />
                      <div className="h-4 w-12 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
                  </div>
                  <div className="ml-4">
                    <div className="p-2 rounded-xl bg-white/50 w-8 h-8" />
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded mb-6" />
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded" />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                    <div className="h-3 w-8 bg-gray-100 rounded" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" />
                </div>
              </div>
              <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-t border-gray-200/50 flex justify-between items-center backdrop-blur-sm">
                <div className="h-6 w-24 bg-gray-100 rounded-xl" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceOverArtistAssignedTasksSkeleton; 