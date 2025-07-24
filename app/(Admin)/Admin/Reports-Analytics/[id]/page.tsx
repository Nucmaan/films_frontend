"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsAnalyticsDetails() {
   const params = useParams();
   const empId = params?.id as string;  

  const { data, error, isLoading } = useSWR(
    empId ? `${API_BASE}/api/subtasks/completed/${empId}` : null,
    fetcher
  );

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Failed to load data</p>;

 
  const subtasks = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <Link href="/Admin/Reports-Analytics" className="text-blue-600 underline text-sm">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">
        Completed Tasks for Emp ID: {empId}
      </h1>
      {subtasks.length === 0 ? (
        <p>No completed tasks found.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Task ID</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Deadline</th>
                <th className="px-3 py-2">Actual. Hours</th>
                <th className="px-3 py-2">Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {subtasks.map((s: any) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.task_id}</td>
                  <td className="px-3 py-2">{s.title}</td>
                  <td className="px-3 py-2">{s.description}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">{s.priority}</td>
                  <td className="px-3 py-2">
                    {s.deadline ? new Date(s.deadline).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2">{s.estimated_hours}</td>
                  <td className="px-3 py-2">{s.time_spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
