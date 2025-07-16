import React from "react";

const VoiceOverArtistMyTasksSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="h-7 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-100 rounded" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 min-w-[200px] w-full sm:w-auto">
              <div className="h-11 w-48 bg-gray-100 rounded-lg" />
              <div className="h-11 w-40 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
        {/* Task Statistics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 rounded-lg p-3 w-12 h-12" />
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
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-gray-300 ring-2 ring-white" />
                    </div>
                    <div>
                      <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-4 w-full bg-gray-100 rounded mb-4 min-h-[2.5rem]" />
                <div className="space-y-3">
                  <div className="h-6 w-24 bg-gray-200 rounded-lg mb-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-6 w-full bg-gray-100 rounded-lg" />
                    <div className="h-6 w-full bg-gray-100 rounded-lg" />
                  </div>
                  <div className="h-6 w-1/2 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceOverArtistMyTasksSkeleton; 