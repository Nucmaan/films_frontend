"use client";

import useSWR from "swr";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function ReportsAnalyticsPage() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/api/subtasks/stats/users-completed`,
    fetcher
  );

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Failed to load data</p>;

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users – Completed  Tasks</h1>

      {rows.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Emp ID</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Exp Level</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Actual Hours</th>
                <th className="px-3 py-2">Completed Count</th>
                <th className="px-3 py-2">Commission ($)</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const commission = (u.total_estimated_hours * 5).toFixed(2);
                return (
                  <tr key={u.assignedTo_empId} className="border-t">
                    <td className="px-3 py-2">{u.assignedTo_empId}</td>
                    <td className="px-3 py-2">{u.assignedTo_name}</td>
                    <td className="px-3 py-2">{u.assignedTo_expLevel}</td>
                    <td className="px-3 py-2">{u.assignedTo_role}</td>
                    <td className="px-3 py-2">
                      {Number(u.total_estimated_hours).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{u.completed_count}</td>
                    <td className="px-3 py-2">${commission}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/Admin/Reports-Analytics/${u.assignedTo_empId}`}
                        className="inline-block rounded bg-[#ff4e00] text-white px-3 py-1 text-xs hover:bg-[#ff6a00] transition-colors duration-200"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
