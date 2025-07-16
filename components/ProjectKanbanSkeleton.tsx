import React from "react";

const columns = [
  { key: "Planning", label: "PLANNING", color: "bg-purple-50 border-t-2 border-purple-400" },
  { key: "In Progress", label: "IN PROGRESS", color: "bg-blue-50 border-t-2 border-blue-400" },
  { key: "Completed", label: "COMPLETED", color: "bg-green-50 border-t-2 border-green-400" },
  { key: "Pending", label: "PENDING", color: "bg-yellow-50 border-t-2 border-yellow-400" },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {/* Color Bar */}
      <div className="h-1.5 w-full bg-gray-200" />
      {/* Image */}
      <div className="w-full aspect-video bg-gray-200" />
      <div className="p-5">
        {/* Title */}
        <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
        {/* Creator & Type */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
        {/* Status Badge */}
        <div className="h-5 w-20 bg-gray-200 rounded-full mb-4" />
        {/* Dates */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        {/* Priority */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        {/* Task count */}
        <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
        {/* Actions */}
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

const ProjectKanbanSkeleton = () => {
  return (
    <div className="flex gap-6 overflow-x-auto mt-6">
      {columns.map((column) => (
        <div key={column.key} className="flex-1 min-w-[320px]">
          <div className={`flex items-center gap-2 mb-2 justify-center p-2 rounded-t-lg ${column.color}`}> 
            <span className="font-bold text-2xl uppercase text-gray-300">{column.label}</span>
            <span className="bg-white px-2 py-1 rounded-full text-sm font-bold text-gray-300">--</span>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
            <div className="w-full mt-2 py-2 border border-dashed rounded text-gray-200 bg-gray-50 text-center">+ Add New Project</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectKanbanSkeleton; 