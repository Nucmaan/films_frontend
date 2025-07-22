"use client"
import React from 'react';
import { useSoundEngineers } from '@/lib/notification/page';  

interface Assigner {
  name: string;
  work_experience_level: string;
  role: string;
}

interface CompletedTask {
  'SubTask.title': string;
  'SubTask.description': string;
  'SubTask.status': string;
  'SubTask.time_spent': number | null;
  'SubTask.estimated_hours': number | null;
  time_taken_in_hours: string;
  time_taken_in_minutes: number;
  assigner: Assigner;
}

interface User {
  name: string;
  completedTasks: CompletedTask[];
}

function SoundEngineerTasksSkeleton() {
  return (
    <div className="max-w-11xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sound Engineers: Task Recording Overview</h1>
      <div className="mb-8 border rounded-lg shadow-sm bg-white">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between animate-pulse">
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="p-4">
          <div className="mb-2 font-semibold">Recorded for:</div>
          <ul className="list-disc pl-6 mb-4">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="h-4 w-24 bg-gray-200 rounded mb-2" />
            ))}
          </ul>
          <div className="mb-2 font-semibold">Tasks:</div>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Task Title</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Estimated Hours</th>
                <th className="p-2 text-left">Time Spent</th>
                <th className="p-2 text-left">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, tIdx) => (
                <tr key={tIdx} className="border-t animate-pulse">
                  <td className="p-2"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SoundEngineer() {
  const { users, isLoading, isError } = useSoundEngineers();

   const soundEngineerMap: {
    [engineerName: string]: {
      engineer: Assigner;
      tasks: CompletedTask[];
      assignees: Set<string>;
      assigneeMap: Map<CompletedTask, string>;
    };
  } = {};

  users.forEach((user: User) => {
    user.completedTasks.forEach((task: CompletedTask) => {
      const engineerName = task.assigner?.name || "Unknown";
      if (!soundEngineerMap[engineerName]) {
        soundEngineerMap[engineerName] = {
          engineer: task.assigner,
          tasks: [],
          assignees: new Set(),
          assigneeMap: new Map(),
        };
      }
      soundEngineerMap[engineerName].tasks.push(task);
      soundEngineerMap[engineerName].assignees.add(user.name);
      soundEngineerMap[engineerName].assigneeMap.set(task, user.name);
    });
  });

  const soundEngineers = Object.values(soundEngineerMap);

  if (isLoading) {
    return <SoundEngineerTasksSkeleton />;
  }
  if (isError) {
    return <div className="p-8 text-center text-red-500">Failed to load sound engineer tracking info.</div>;
  }
  if (!soundEngineers.length) {
    return <div className="p-8 text-center text-gray-500">No sound engineer tracking data found.</div>;
  }

  return (
    <div className="max-w-11xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sound Engineers: Task Recording Overview</h1>
      {soundEngineers.map(({ engineer, tasks, assignees, assigneeMap }, idx) => (
        <div key={(engineer?.name || 'Unknown') + idx} className="mb-8 border rounded-lg shadow-sm bg-white">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-semibold text-lg">Sound Engineer:</span>{' '}
              <span className="text-blue-700 font-medium">{engineer?.name}</span>
              <span className="ml-4 text-gray-600 text-sm">({engineer?.role})</span>
            </div>
            <div>
              <span className="font-semibold">Total Tasks Recorded:</span>{' '}
              <span className="text-green-700 font-bold">{tasks.length}</span>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-2 font-semibold">Recorded for:</div>
            <ul className="list-disc pl-6 mb-4">
              {[...assignees].map((assignee: string, i: number) => (
                <li key={assignee + i}>{assignee}</li>
              ))}
            </ul>
            <div className="mb-2 font-semibold">Tasks:</div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Task Title</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actual Time</th>
                  <th className="p-2 text-left">Time Spent</th>
                  <th className="p-2 text-left">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task: CompletedTask, tIdx: number) => (
                  <tr key={task['SubTask.title'] + tIdx} className="border-t">
                    <td className="p-2">{tIdx + 1}</td>
                    <td className="p-2">{task['SubTask.title']}</td>
                    <td className="p-2">{task['SubTask.description']}</td>
                    <td className="p-2">{task['SubTask.status']}</td>
                    <td className="p-2">{task['SubTask.estimated_hours'] ?? '-'}</td>
                    <td className="p-2">{task['SubTask.time_spent'] ?? '-'}</td>
                    <td className="p-2">{assigneeMap.get(task) ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}