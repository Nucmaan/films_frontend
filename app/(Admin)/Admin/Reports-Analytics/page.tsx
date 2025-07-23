"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  BarChart2,
  ExternalLink,
  PieChart,
  TrendingUp,
  ClipboardCheck,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUsersWithCompletedTasks } from "@/lib/analytics/page.js"; // Assuming this hook returns the user data
import ReportsAnalyticsSkeleton from "@/components/ReportsAnalyticsSkeleton";

// Define the User interface based on the properties used in your component
interface User {
  id: string;
  name: string;
  role: string;
  work_experience_level: string;
  totalHours: number;
  hourlyRate: number;
  monthlyCommission: number;
  // Add any other properties that might be part of the user object
}

export default function ReportsAnalyticsPage() {
  const taskServiceUrl = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize selectedMonth to current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  // Add this destructuring to get all needed values from the hook
  // Explicitly type the 'users' array as 'User[]'
  const {
    users, // This will now be inferred as User[] if the hook's return type is properly set
    isLoading,
    error,
    apiMessage,
    totalStaff,
    totalHours,
    averageRate,
    totalCommission
  }: {
    users: User[]; // Explicitly type users as an array of User
    isLoading: boolean;
    error: any; // You might want to define a more specific error type
    apiMessage: string;
    totalStaff: number;
    totalHours: number;
    averageRate: number;
    totalCommission: number;
  } = useUsersWithCompletedTasks(
    taskServiceUrl,
    selectedMonth,
    selectedStatus
  );

  // Filtered users will now also correctly infer its type as User[]
  const filteredUsers = users.filter((user: User) => // Explicitly type user here for clarity, though it might be inferred
    searchQuery === "" || user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = () => {
    const headers = ["NO", "Name", "Job Position", "Experience Level", "Total Hours", "Rate ($/hour)", "Monthly Commission ($)"];
    // The 'user' parameter here will now correctly be typed as 'User'
    const csvData = filteredUsers.map((user: User, index: number) => [
      index + 1,
      user.name,
      user.role,
      user.work_experience_level,
      user.totalHours.toFixed(1),
      `$${user.hourlyRate.toFixed(2)}`,
      `$${user.monthlyCommission.toFixed(2)}`
    ]);
    csvData.push([
      "",
      "TOTAL",
      "",
      "",
      totalHours.toFixed(1),
      "",
      `$${totalCommission.toFixed(2)}`
    ]);
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const month = selectedMonth === getCurrentMonth()
      ? format(new Date(), "MMMM_yyyy")
      : selectedMonth.replace("-", "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `team_commission_${month}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <ReportsAnalyticsSkeleton />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-red-600">Error loading analytics data.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Track team performance and task progress</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Last updated: <span className="font-medium text-gray-700">{format(new Date(), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-blue-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Total Staff</div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <PieChart className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{totalStaff}</div>
                      <div className="text-sm text-gray-500 mb-1">with completed tasks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-green-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Total Hours</div>
                      <div className="p-2 bg-green-50 rounded-full">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {totalHours.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">hours worked</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-purple-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Average Rate</div>
                      <div className="p-2 bg-purple-50 rounded-full">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${averageRate.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">per hour</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-amber-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Total Commission</div>
                      <div className="p-2 bg-amber-50 rounded-full">
                        <ClipboardCheck className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">${totalCommission.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mb-1">this month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

           <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1 border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full bg-transparent border-gray-200 rounded-xl h-12 text-base focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[200px] bg-transparent border-gray-200 rounded-xl h-12">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md p-2 border border-gray-100">
                    <SelectItem
                      value="all"
                      className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {selectedStatus === "all" ? (
                        <span className="text-blue-500 mr-2">✓</span>
                      ) : (
                        <span className="mr-2"></span>
                      )}
                      All Staff
                    </SelectItem>
                    <SelectItem
                      value="Translator"
                      className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {selectedStatus === "Translator" && <span className="text-blue-500 mr-2">✓</span>}
                      Translators
                    </SelectItem>
                    <SelectItem
                      value="Voice-over Artist"
                      className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {selectedStatus === "Voice-over Artist" && <span className="text-blue-500 mr-2">✓</span>}
                      Voice-over Artists
                    </SelectItem>
                    <SelectItem
                      value="Sound Engineer"
                      className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {selectedStatus === "Sound Engineer" && <span className="text-blue-500 mr-2">✓</span>}
                      Sound Engineers
                    </SelectItem>
                    <SelectItem
                      value="Admin"
                      className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {selectedStatus === "Admin" && <span className="text-blue-500 mr-2">✓</span>}
                      Admins
                    </SelectItem>
                    <SelectItem
                      value="Film Dubbing Team"
                      className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {selectedStatus === "Film Dubbing Team" && <span className="text-blue-500 mr-2">✓</span>}
                      Film Dubbing Team
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                {/* Replace dropdown with month picker */}
                <div className="flex items-center gap-2">
                  <label htmlFor="month-picker" className="text-sm text-gray-600">Select Month:</label>
                  <Input
                    id="month-picker"
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    min="2025-01"
                    max="2099-12"
                    className="w-[200px] bg-transparent border-gray-200 rounded-xl h-12"
                  />
                </div>
                <div className="mt-2">
                  <button
                    onClick={handleDownload}
                    className="w-full text-center text-blue-600 py-3 px-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

           <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Team Compensation Summary</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {selectedMonth === getCurrentMonth()
                        ? "Current month - Staff with completed tasks"
                        : `${selectedMonth} - Staff with completed tasks`}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="px-4 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead className="w-12 font-semibold text-gray-600">NO</TableHead>
                      <TableHead className="font-semibold text-gray-600">Name</TableHead>
                      <TableHead className="font-semibold text-gray-600">Job Position</TableHead>
                      <TableHead className="font-semibold text-gray-600">Experience Level</TableHead>
                      <TableHead className="font-semibold text-gray-600">Total Hours</TableHead>
                      <TableHead className="font-semibold text-gray-600">Rate ($/hour)</TableHead>
                      <TableHead className="font-semibold text-gray-600">Monthly Commission ($)</TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16 bg-gray-50/20">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100/80 rounded-full">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-1 text-center">
                              <p className="text-lg font-medium text-gray-600">
                                {apiMessage || "No staff found"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {apiMessage ? "" : "No users with completed tasks match your filters"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user: User, index: number) => (
                        <TableRow key={user.id} className="hover:bg-blue-50/5 transition-colors duration-150 group border-b border-gray-100">
                          <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {user.work_experience_level}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.totalHours.toFixed(1)}</TableCell>
                          <TableCell>US$ {user.hourlyRate.toFixed(2)}</TableCell>
                          <TableCell>US$ {user.monthlyCommission.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/Admin/Reports-Analytics/${user.id}`}>
                              <button
                                className="inline-flex items-center cursor-pointer gap-1.5 px-4 py-2 text-sm rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors shadow-sm hover:shadow"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Details
                              </button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}

                    {filteredUsers.length > 0 && (
                      <TableRow className="bg-gray-50/50 font-medium border-t-2 border-gray-200">
                        <TableCell colSpan={6} className="text-right pr-4 font-bold text-gray-700">
                          Total Monthly Commission:
                        </TableCell>
                        <TableCell className="font-bold">
                          US$ {totalCommission.toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 py-3 px-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Hourly rates and stats are provided by the backend.</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
