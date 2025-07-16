import React from "react";

const NotificationsSkeleton = () => {
  return (
    <div className="w-full h-full min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-[1500px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="h-7 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="relative w-full lg:w-auto lg:flex-1 lg:max-w-md">
            <div className="h-11 w-full bg-gray-100 rounded-xl" />
          </div>
        </div>
        {/* Notification List Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-gray-50 relative">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 p-2 rounded-full w-9 h-9" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSkeleton; 