import React from "react";

const AdminLayoutSkeleton = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 animate-pulse">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b border-gray-100 fixed top-0 left-[260px] right-0 z-20 rounded-bl-3xl h-16 flex items-center px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-6 w-full justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="h-10 w-10 bg-gray-100 rounded-full" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-100 rounded-full" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </header>

      {/* Sidebar Skeleton */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-gray-100 z-30 flex flex-col pt-16">
        <div className="flex flex-col gap-4 p-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-gray-100 rounded" />
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-grow pt-16 ml-[260px] p-4 md:p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-white py-4 border-t border-gray-200 text-center text-sm text-gray-400 ml-[260px]">
        <div className="h-4 w-40 bg-gray-100 rounded mx-auto" />
      </footer>
    </div>
  );
};

export default AdminLayoutSkeleton; 