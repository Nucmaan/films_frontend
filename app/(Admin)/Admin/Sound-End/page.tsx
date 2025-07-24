"use client";
import useSWR from "swr";
import Link from "next/link";

interface CompletedSubtask {
  assignee_empId: string;
  assignee_name: string;
  assignee_expLevel: string;
  assignee_role: string;
  total_estimated_hours: number;
  completed_count: string;
}

const fetcher = (url: string): Promise<CompletedSubtask[]> =>
  fetch(url).then((res) => res.json());

const CompletedSubtasks = () => {
  const { data, error, isLoading } = useSWR<CompletedSubtask[]>(
    `${process.env.NEXT_PUBLIC_TASK_SERVICE_URL}/api/subtasks/stats/admin/completed`,
    fetcher
  );

  if (error) return <p className="text-red-500">Failed to load data</p>;
  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Sound Engineers: Task Recording Overview
      </h1>
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Experience Level</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Total Hours</th>
            <th className="p-2 border">Completed</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((user, index) => (
            <tr key={index} className="text-center">
              <td className="p-2 border">{user.assignee_name}</td>
              <td className="p-2 border">{user.assignee_expLevel}</td>
              <td className="p-2 border">{user.assignee_role}</td>
              <td className="p-2 border">{user.total_estimated_hours}</td>
              <td className="p-2 border">{user.completed_count}</td>
              <td className="p-2 border">
                <Link
                  href={`/Admin/Sound-End/${encodeURIComponent(user.assignee_empId)}`}
                  className="inline-block rounded bg-[#ff4e00] text-white px-3 py-1 text-xs hover:bg-[#ff4e00]">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedSubtasks;
