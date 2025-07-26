"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DollarSign
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsAnalyticsDetails() {
  const params = useParams();
  const empId = params?.id as string;  

  const { data, error, isLoading } = useSWR(
    empId ? `${API_BASE}/api/subtasks/completed/${empId}` : null,
    fetcher
  );



  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-red-600">Failed to load data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtasks = Array.isArray(data) ? data : [];

  // Calculate statistics
  const totalTasks = subtasks.length;
  const totalHours = subtasks.reduce((sum: number, task: any) => sum + (task.estimated_hours || 0), 0);
  const totalSpentTime = subtasks.reduce((sum: number, task: any) => sum + (task.time_spent || 0), 0);
  const totalCommission = totalHours * 5; // $5 per hour

  // Count tasks by status 
  const tasksByStatus = {
    "To Do": subtasks.filter((task: any) => task.status === "To Do").length,
    "In Progress": subtasks.filter((task: any) => task.status === "In Progress").length,
    "Review": subtasks.filter((task: any) => task.status === "Review").length,
    "Completed": subtasks.filter((task: any) => task.status === "Completed").length,
  };

  // Count tasks by priority
  const tasksByPriority = {
    "High": subtasks.filter((task: any) => task.priority === "High").length,
    "Medium": subtasks.filter((task: any) => task.priority === "Medium").length,
    "Low": subtasks.filter((task: any) => task.priority === "Low").length,
  };

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
                  Employee #{empId} Performance Report
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
                      <AvatarFallback className="text-2xl font-bold bg-white/10 text-white">
                        #{empId}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold">Employee #{empId}</h2>
                      <p className="text-sm text-blue-100">Performance Profile</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Employee ID</span>
                    <Badge variant="outline" className="bg-white border-gray-200">
                      #{empId}
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
                      <div className="text-sm font-medium text-gray-500">Tasks Completed</div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <Layers className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
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
                      <div className="text-sm font-medium text-gray-500">Time Spent</div>
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
                      <div className="text-sm font-medium text-gray-500">Total Earnings</div>
                      <div className="p-2 bg-amber-50 rounded-full">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">${totalCommission.toFixed(2)}</div>
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
                  <CardTitle className="text-lg font-semibold">Completed Tasks Details</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Detailed breakdown of all completed tasks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {subtasks.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-100/80 rounded-full">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-lg font-medium text-gray-600">No completed tasks found</p>
                      <p className="text-sm text-gray-500">This employee has no completed tasks</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                                         <TableHeader>
                       <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                         <TableHead className="font-semibold text-gray-600">Task ID</TableHead>
                         <TableHead className="font-semibold text-gray-600">Title</TableHead>
                         <TableHead className="font-semibold text-gray-600">Description</TableHead>
                         <TableHead className="font-semibold text-gray-600">Status</TableHead>
                         <TableHead className="font-semibold text-gray-600">Priority</TableHead>
                         <TableHead className="font-semibold text-gray-600">Deadline</TableHead>
                         <TableHead className="font-semibold text-gray-600">Actual Hours</TableHead>
                         <TableHead className="font-semibold text-gray-600">Time Spent</TableHead>
                       </TableRow>
                     </TableHeader>
                    <TableBody>
                      {subtasks.map((task: any, index: number) => {
                        // Determine status badge style
                        let statusBadge;
                        switch (task.status) {
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
                            statusBadge = <Badge variant="outline" className="px-2.5 py-1 rounded-full">{task.status}</Badge>;
                        }

                        // Determine priority badge style
                        let priorityBadge;
                        switch (task.priority) {
                          case "High":
                            priorityBadge = <Badge variant="outline" className="px-2.5 py-1 bg-red-50 border-red-200 text-red-700 font-medium rounded-full">High</Badge>;
                            break;
                          case "Medium":
                            priorityBadge = <Badge variant="outline" className="px-2.5 py-1 bg-yellow-50 border-yellow-200 text-yellow-700 font-medium rounded-full">Medium</Badge>;
                            break;
                          case "Low":
                            priorityBadge = <Badge variant="outline" className="px-2.5 py-1 bg-green-50 border-green-200 text-green-700 font-medium rounded-full">Low</Badge>;
                            break;
                          default:
                            priorityBadge = <Badge variant="outline" className="px-2.5 py-1 rounded-full">{task.priority}</Badge>;
                        }

                        // Format deadline
                        const deadline = task.deadline 
                          ? format(new Date(task.deadline), "MMM dd, yyyy") 
                          : "N/A";

                        // Check if deadline has passed
                        const deadlinePassed = task.deadline && new Date(task.deadline) < new Date() && task.status !== "Completed";

                        return (
                                                     <TableRow 
                             key={task.id} 
                             className="hover:bg-blue-50/5 transition-colors duration-150 border-b border-gray-100 last:border-0"
                           >
                             <TableCell className="font-medium">{task.task_id}</TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="font-medium text-gray-900 truncate">{task.title}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="text-sm text-gray-600 truncate">{task.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>{statusBadge}</TableCell>
                            <TableCell>{priorityBadge}</TableCell>
                            <TableCell>
                              <span className={deadlinePassed ? "text-red-600 font-medium" : "font-medium"}>
                                {deadline}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <CalendarClock className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-medium">{task.estimated_hours} hrs</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Timer className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-medium">{task.time_spent || 0} hrs</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                                         <TableFooter className="bg-gray-50/80">
                       <TableRow>
                         <TableCell colSpan={6} className="font-semibold text-gray-700">Total</TableCell>
                         <TableCell className="font-semibold text-gray-700">{totalHours.toFixed(2)} hrs</TableCell>
                         <TableCell className="font-semibold text-gray-700">${totalCommission.toFixed(2)}</TableCell>
                       </TableRow>
                     </TableFooter>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
