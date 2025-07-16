"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  CalendarClock, 
  FileText, 
  BarChart3,
  BarChart,
  Layers,
  Timer,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserWithTasks } from "@/lib/analytics/page.js";
import UserReportSkeleton from "@/components/UserReportSkeleton";

interface UserWithTasks {
  id: number;
  name: string;
  role: string;
  profile_image: string;
  work_experience_level: string;
  tasks: TaskStatusUpdate[];
}

interface TaskStatusUpdate {
  id: number;
  task_id: number;
  updated_by: number;
  status: string;
  updated_at: string;
  time_taken_in_hours: string | null;
  time_taken_in_minutes: number | null;
  "SubTask.id": number;
  "SubTask.title": string;
  "SubTask.status": string;
  "SubTask.priority": string;
  "SubTask.estimated_hours": number;
  "SubTask.description": string;
  "SubTask.deadline": string;
  "SubTask.file_url"?: string;
  assigned_user: string;
  profile_image: string;
}

export default function UserReportsPage() {
  const params = useParams();
  const userId = params.id as string;
  const taskServiceUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const { user, isLoading, error, mutate } = useUserWithTasks(taskServiceUrl, userId);

  // Define rates by work experience level
  const getRateForExperienceLevel = (experienceLevel: string): number => {
    switch (experienceLevel) {
      case "Entry Level":
        return 5.00;
      case "Mid Level":
        return 6.00;
      case "Senior Level":
        return 8.00;
      default:
        return 5.00;  // Default to Entry Level rate
    }
  };

  // Get the hourly rate based on user's experience level
  const getUserHourlyRate = (): number => {
    if (!user?.work_experience_level) return 5.00; // Default rate
    return getRateForExperienceLevel(user.work_experience_level);
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalHours = 0;
    let totalAmount = 0;
    let totalSpentTime = 0;
    const hourlyRate = getUserHourlyRate();
    (user?.tasks || []).forEach((task: TaskStatusUpdate) => {
      const hours = task["SubTask.estimated_hours"] || 0;
      // Calculate spent time from hours and minutes
      const spentHours = task.time_taken_in_hours ? parseFloat(task.time_taken_in_hours) : 0;
      const spentMinutes = task.time_taken_in_minutes ? task.time_taken_in_minutes / 60 : 0;
      const totalSpent = spentHours + spentMinutes;
      totalHours += hours;
      totalAmount += hours * hourlyRate;
      totalSpentTime += totalSpent;
    });
    return { totalHours, totalAmount, totalSpentTime };
  };

  const { totalHours, totalAmount, totalSpentTime } = calculateTotals();

  // Calculate statistics
  const taskUpdates = user?.tasks || [];
  const totalTasks = taskUpdates.length;
  // Calculate unique tasks (by task_id)
  const uniqueTaskIds = new Set(taskUpdates.map((task: TaskStatusUpdate) => task.task_id));
  const uniqueTasks = uniqueTaskIds.size;
  // Count tasks by status
  const tasksByStatus = {
    "To Do": taskUpdates.filter((task: TaskStatusUpdate) => task["SubTask.status"] === "To Do").length,
    "In Progress": taskUpdates.filter((task: TaskStatusUpdate) => task["SubTask.status"] === "In Progress").length,
    "Review": taskUpdates.filter((task: TaskStatusUpdate) => task["SubTask.status"] === "Review").length,
    "Completed": taskUpdates.filter((task: TaskStatusUpdate) => task["SubTask.status"] === "Completed").length,
  };
  // Calculate completion rate
  const completionRate = totalTasks > 0 
    ? Math.round((tasksByStatus["Completed"] / totalTasks) * 100) 
    : 0;

  if (isLoading) {
    return (
      <UserReportSkeleton />
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-red-600">Error loading user analytics data.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/Admin/Reports-Analytics" className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200 shadow-sm hover:shadow">
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {user?.name || "User"}'s Performance Report
                </h1>
                <p className="text-sm text-gray-500 mt-1">Detailed task activity and performance metrics</p>
              </div>
            </div>
            <div className="hidden md:block">
              <Badge variant="outline" className="px-4 py-2 bg-blue-50 border-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Last updated: {format(new Date(), 'MMM dd, yyyy')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* User profile and summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="lg:col-span-1 border border-gray-100 overflow-hidden shadow-sm hover:shadow transition-all rounded-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                      <AvatarImage src={user?.profile_image} />
                      <AvatarFallback className="text-2xl font-bold bg-white/10 text-white">
                        {user?.name?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold">{user?.name}</h2>
                      <p className="text-sm text-blue-100">{user?.role} - {user?.work_experience_level}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">User ID</span>
                    <Badge variant="outline" className="bg-white border-gray-200">
                      #{userId}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary stats cards */}
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-blue-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Tasks Assigned</div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <Layers className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{uniqueTasks}</div>
                      <div className="text-sm text-gray-500 mb-1">total tasks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-green-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Est. Hours</div>
                      <div className="p-2 bg-green-50 rounded-full">
                        <Timer className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{totalHours.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mb-1">hrs estimated</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-indigo-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Spent Hours</div>
                      <div className="p-2 bg-indigo-50 rounded-full">
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{totalSpentTime.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mb-1">hrs spent</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-amber-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Completed Tasks</div>
                      <div className="p-2 bg-amber-50 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{tasksByStatus["Completed"]}</div>
                      <div className="text-sm text-gray-500 mb-1">tasks finished</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-purple-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Total Earnings</div>
                      <div className="p-2 bg-purple-50 rounded-full">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mb-1">for all tasks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Status Distribution */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <BarChart className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Task Status Distribution</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Overview of tasks by current status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-3">
                    <AlertCircle className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{tasksByStatus["To Do"]}</div>
                  <div className="text-sm font-medium text-gray-500 mt-1">To Do</div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (tasksByStatus["To Do"] / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{tasksByStatus["In Progress"]}</div>
                  <div className="text-sm font-medium text-blue-600 mt-1">In Progress</div>
                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (tasksByStatus["In Progress"] / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-amber-100 rounded-full mb-3">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{tasksByStatus["Review"]}</div>
                  <div className="text-sm font-medium text-amber-600 mt-1">In Review</div>
                  <div className="mt-3 w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className="bg-amber-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (tasksByStatus["Review"] / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-green-100 rounded-full mb-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{tasksByStatus["Completed"]}</div>
                  <div className="text-sm font-medium text-green-600 mt-1">Completed</div>
                  <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (tasksByStatus["Completed"] / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Task History</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Detailed breakdown of all assigned tasks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead className="w-12 font-semibold text-gray-600">#</TableHead>
                      <TableHead className="font-semibold text-gray-600">Task</TableHead>
                      <TableHead className="font-semibold text-gray-600">Status</TableHead>
                      <TableHead className="font-semibold text-gray-600">Estimated</TableHead>
                      <TableHead className="font-semibold text-gray-600">Spent</TableHead>
                      <TableHead className="font-semibold text-gray-600">Rate/Hr</TableHead>
                      <TableHead className="font-semibold text-gray-600">Total</TableHead>
                      <TableHead className="font-semibold text-gray-600">Deadline</TableHead>
                      <TableHead className="font-semibold text-gray-600">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taskUpdates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-16 bg-gray-50/20">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100/80 rounded-full">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-1 text-center">
                              <p className="text-lg font-medium text-gray-600">No tasks found</p>
                              <p className="text-sm text-gray-500">This user has no task history</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      taskUpdates.map((task: TaskStatusUpdate, index: number) => {
                        // Determine status badge style
                        let statusBadge;
                        switch (task["SubTask.status"]) {
                          case "To Do":
                            statusBadge = <Badge variant="outline" className="px-2.5 py-1 bg-gray-50 border-gray-200 text-gray-700 font-medium rounded-full">To Do</Badge>;
                            break;
                          case "In Progress":
                            statusBadge = <Badge variant="outline" className="px-2.5 py-1 bg-blue-50 border-blue-200 text-blue-700 font-medium rounded-full">In Progress</Badge>;
                            break;
                          case "Review":
                            statusBadge = <Badge variant="outline" className="px-2.5 py-1 bg-yellow-50 border-yellow-200 text-yellow-700 font-medium rounded-full">Review</Badge>;
                            break;
                          case "Completed":
                            statusBadge = <Badge variant="outline" className="px-2.5 py-1 bg-green-50 border-green-200 text-green-700 font-medium rounded-full">Completed</Badge>;
                            break;
                          default:
                            statusBadge = <Badge variant="outline" className="px-2.5 py-1 rounded-full">{task["SubTask.status"]}</Badge>;
                        }

                        // Format deadline
                        const deadline = task["SubTask.deadline"] 
                          ? format(new Date(task["SubTask.deadline"]), "MMM dd, yyyy") 
                          : "N/A";

                        // Check if deadline has passed
                        const deadlinePassed = task["SubTask.deadline"] && new Date(task["SubTask.deadline"]) < new Date() && task["SubTask.status"] !== "Completed";

                        // Format updated date
                        const lastUpdated = format(new Date(task.updated_at), "MMM dd, yyyy HH:mm");
                        
                        // Calculate spent time
                        const spentHours = task.time_taken_in_hours ? parseFloat(task.time_taken_in_hours) : 0;
                        const spentMinutes = task.time_taken_in_minutes ? task.time_taken_in_minutes / 60 : 0;
                        const spentTime = spentHours + spentMinutes;
                        
                        // Get the hourly rate based on user's experience level
                        const hourlyRate = getUserHourlyRate();
                        
                        // Calculate the total for this task
                        const taskTotal = (task["SubTask.estimated_hours"] || 0) * hourlyRate;

                        return (
                          <TableRow 
                            key={task.id} 
                            className="hover:bg-blue-50/5 transition-colors duration-150 border-b border-gray-100 last:border-0"
                          >
                            <TableCell className="font-medium text-gray-600">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="font-medium text-gray-900 truncate">{task["SubTask.title"]}</div>
                                <div className="text-xs text-gray-500 mt-1 truncate">{task["SubTask.description"]}</div>
                              </div>
                            </TableCell>
                            <TableCell>{statusBadge}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <CalendarClock className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-medium">{task["SubTask.estimated_hours"]} hrs</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Timer className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-medium">{spentTime.toFixed(2)} hrs</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-medium">${hourlyRate.toFixed(2)}/hr</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-medium">${taskTotal.toFixed(2)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={deadlinePassed ? "text-red-600 font-medium" : "font-medium"}>
                                {deadline}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">{lastUpdated}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                  {taskUpdates.length > 0 && (
                    <TableFooter className="bg-gray-50/80">
                      <TableRow>
                        <TableCell colSpan={3} className="font-semibold text-gray-700">Total</TableCell>
                        <TableCell className="font-semibold text-gray-700">{totalHours.toFixed(2)} hrs</TableCell>
                        <TableCell className="font-semibold text-gray-700">{totalSpentTime.toFixed(2)} hrs</TableCell>
                        <TableCell className="font-semibold text-gray-700"></TableCell>
                        <TableCell className="font-semibold text-gray-700">${totalAmount.toFixed(2)}</TableCell>
                        <TableCell colSpan={2} className="font-semibold text-blue-700">Monthly Total: ${totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={8} className="text-right text-sm text-gray-500">
                          <div className="flex justify-end items-center gap-4">
                            <span>Hourly Rate: ${getUserHourlyRate().toFixed(2)}/hr ({user?.work_experience_level || "Entry Level"})</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}