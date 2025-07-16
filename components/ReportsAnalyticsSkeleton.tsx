import React from "react";

const ReportsAnalyticsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white animate-pulse">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl w-12 h-12" />
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-100 overflow-hidden shadow-sm rounded-xl bg-white">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-gray-200" />
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="p-2 bg-gray-100 rounded-full w-8 h-8" />
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="h-8 w-16 bg-gray-200 rounded" />
                      <div className="h-4 w-20 bg-gray-100 rounded mb-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search/Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 border border-gray-100 shadow-sm rounded-xl bg-white p-3">
                <div className="h-10 w-full bg-gray-100 rounded" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 py-5 px-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-100 rounded" />
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/80">
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="py-3 px-4">
                          <div className="h-4 w-20 bg-gray-100 rounded" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((row) => (
                      <tr key={row} className="border-b border-gray-100">
                        {[...Array(8)].map((_, i) => (
                          <td key={i} className="py-4 px-4">
                            <div className="h-4 w-full bg-gray-100 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gray-50 py-3 px-6">
              <div className="h-4 w-64 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsSkeleton; 