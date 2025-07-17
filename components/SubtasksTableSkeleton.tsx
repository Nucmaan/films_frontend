import React from "react";

export default function SubtasksTableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="border-b">
            {["Title", "Assignees", "Deadline", "Start Time", "Status", "Estimated Hours", "Actions"].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6"
              >
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(4)].map((_, idx) => (
            <tr key={idx}>
              {/* Title */}
              <td className="px-4 py-4 w-1/6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-200 mr-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </td>
              {/* Assignees */}
              <td className="px-4 py-4 w-1/6">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              </td>
              {/* Deadline */}
              <td className="px-4 py-4 w-1/6">
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </td>
              {/* Start Time */}
              <td className="px-4 py-4 w-1/6">
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </td>
              {/* Status */}
              <td className="px-4 py-4 w-1/6">
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </td>
              {/* Estimated Hours */}
              <td className="px-4 py-4 w-1/6">
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </td>
              {/* Actions */}
              <td className="px-4 py-4 w-28 text-right">
                <div className="flex justify-end gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 