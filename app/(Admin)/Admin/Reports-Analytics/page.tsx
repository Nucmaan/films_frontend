"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
  BarChart2,
  ClipboardCheck,
  Download,
  DollarSign,
  PieChart,
  TrendingUp,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsAnalyticsPage() {
  const now = new Date();
  const defaultYear = now.getFullYear().toString();
  const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");



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

  const rows = Array.isArray(data) ? data : [];

  // Filter data based on search query and selected role
  const filteredRows = rows.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.assignedTo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.assignedTo_empId.toString().includes(searchQuery);
    
    const matchesRole = selectedRole === "all" || user.assignedTo_role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalUsers = filteredRows.length;
  const totalHours = filteredRows.reduce((sum, u) => sum + u.total_estimated_hours, 0);
  const totalCommission = filteredRows.reduce((sum, u) => sum + (u.total_estimated_hours * 5), 0);
  const averageRate = totalUsers > 0 ? totalCommission / totalHours : 0;

  // Get unique roles for filter
  const uniqueRoles = [...new Set(rows.map(u => u.assignedTo_role))];

  // Function to handle downloading the data as CSV
  const handleDownload = () => {
    const headers = ["Emp ID", "Name", "Exp Level", "Role", "Actual Hours", "Completed Count", "Commission ($)"];
    
    const csvData = filteredRows.map((user, index) => [
      user.assignedTo_empId,
      user.assignedTo_name,
      user.assignedTo_expLevel,
      user.assignedTo_role,
      Number(user.total_estimated_hours).toFixed(2),
      user.completed_count,
      (user.total_estimated_hours * 5).toFixed(2)
    ]);
    
    csvData.push([
      "TOTAL",
      "",
      "",
      "",
      totalHours.toFixed(2),
      "",
      totalCommission.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `users_completed_tasks_${format(new Date(), "yyyy_MM_dd")}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



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
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Reports & Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Users with completed tasks performance
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Last updated:{" "}
                <span className="font-medium text-gray-700">
                  {format(new Date(), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-blue-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">
                        Total Users
                      </div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <PieChart className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {totalUsers}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        with completed tasks
                      </div>
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
                      <div className="text-sm font-medium text-gray-500">
                        Total Hours
                      </div>
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
                      <div className="text-sm font-medium text-gray-500">
                        Average Rate
                      </div>
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
                      <div className="text-sm font-medium text-gray-500">
                        Total Commission
                      </div>
                      <div className="p-2 bg-amber-50 rounded-full">
                        <ClipboardCheck className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${totalCommission.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">total earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <Card className="flex-1 border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or employee ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full bg-transparent border-gray-200 rounded-xl h-12 text-base focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Role Filter */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[200px] bg-transparent border-gray-200 rounded-xl h-12">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md p-2 border border-gray-100">
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Year Filter */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[140px] bg-transparent border-gray-200 rounded-xl h-12">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md p-2 border border-gray-100">
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Month Filter */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px] bg-transparent border-gray-200 rounded-xl h-12">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md p-2 border border-gray-100">
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Users - Completed Tasks
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Performance summary of users with completed tasks
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
              {filteredRows.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-100/80 rounded-full">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-lg font-medium text-gray-600">
                        No data available
                      </p>
                      <p className="text-sm text-gray-500">
                        No users match your current filters
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="font-semibold text-gray-600">
                          Emp ID
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          Exp Level
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          Role
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          Actual Hours
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          Completed Count
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          Commission ($)
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map((user) => {
                        const commission = (
                          user.total_estimated_hours * 5
                        ).toFixed(2);
                        return (
                          <TableRow
                            key={user.assignedTo_empId}
                            className="hover:bg-blue-50/5 transition-colors duration-150 group border-b border-gray-100"
                          >
                            <TableCell className="font-medium">
                              {user.assignedTo_empId}
                            </TableCell>
                            <TableCell>{user.assignedTo_name}</TableCell>
                            <TableCell>{user.assignedTo_expLevel}</TableCell>
                            <TableCell>{user.assignedTo_role}</TableCell>
                            <TableCell>
                              {Number(user.total_estimated_hours).toFixed(2)}
                            </TableCell>
                            <TableCell>{user.completed_count}</TableCell>
                            <TableCell>US$ {commission}</TableCell>
                            <TableCell className="text-right">
                              <Link
                                href={`/Admin/Reports-Analytics/${user.assignedTo_empId}`}
                              >
                                <button className="inline-flex items-center cursor-pointer px-4 py-2 text-sm rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors shadow-sm hover:shadow">
                                  View
                                </button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {filteredRows.length > 0 && (
                        <TableRow className="bg-gray-50/50 font-medium border-t-2 border-gray-200">
                          <TableCell
                            colSpan={6}
                            className="text-right pr-4 font-bold text-gray-700"
                          >
                            Total Commission:
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
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 py-3 px-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" />
                <span>
                  * Commission calculated at $5 per hour based on estimated hours
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
