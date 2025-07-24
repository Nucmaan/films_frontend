"use client";
import React from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface Task {
  title: string;
  description: string;
  status: string;
  deadline: string | null;
  estimated_hours: number;
  time_spent: number;
  assignedTo_name: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string): Promise<Task[]> =>
  fetch(url).then((res) => res.json());

export default function SoundEndPage() {
  const { id } = useParams<{ id: string }>();  

  const { data, error, isLoading } = useSWR<Task[]>(
    `${process.env.NEXT_PUBLIC_TASK_SERVICE_URL}/api/subtasks/assignee/${id}/subtasks`,
    fetcher
  );

  if (error) return <p className="text-red-500">Failed to load data</p>;
  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Sound Engineers: Task Recording Overview
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Deadline</th>
              <th className="p-2 border">Actual. Hours</th>
              <th className="p-2 border">Time Spent</th>
              <th className="p-2 border">Assigner</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((task, index) => (
              <tr key={index} className="text-center">
                <td className="p-2 border">{task.title}</td>
                <td className="p-2 border">{task.description}</td>
                <td className="p-2 border">{task.status}</td>
                <td className="p-2 border">
                  {task.deadline
                    ? new Date(task.deadline).toLocaleString()
                    : "N/A"}
                </td>
                <td className="p-2 border">{task.estimated_hours}</td>
                <td className="p-2 border">{task.time_spent}</td>
                <td className="p-2 border">{task.assignedTo_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
