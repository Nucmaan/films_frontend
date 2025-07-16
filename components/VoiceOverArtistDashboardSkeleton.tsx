import React from "react";

const VoiceOverArtistDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header Section Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gray-200" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-gray-300 ring-2 ring-white" />
              </div>
              <div>
                <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="h-4 w-40 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
        {/* Task Statistics Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-7 w-12 bg-gray-100 rounded" />
                </div>
                <div className="p-2 bg-gray-100 rounded-lg w-8 h-8" />
              </div>
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceOverArtistDashboardSkeleton; 