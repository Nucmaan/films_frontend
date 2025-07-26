"use client";

import { useState } from "react";
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
  ExternalLink, 
  PieChart, 
  TrendingUp, 
  ClipboardCheck, 
  Download, 
  DollarSign,
  Headphones
} from 'lucide-react';

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

  const users = data || [];

  // Filter data based on search query and selected role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.assignee_empId.toString().includes(searchQuery);
    
    const matchesRole = selectedRole === "all" || user.assignee_role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalUsers = filteredUsers.length;
  const totalHours = filteredUsers.reduce((sum, u) => sum + u.total_estimated_hours, 0);
  const totalCompleted = filteredUsers.reduce((sum, u) => sum + parseInt(u.completed_count), 0);
  const totalCommission = totalHours * 5; // $5 per hour

  // Get unique roles for filter
  const uniqueRoles = [...new Set(users.map(u => u.assignee_role))];

  // Function to handle downloading the data as CSV
  const handleDownload = () => {
    const headers = ["Name", "Experience Level", "Role", "Total Hours", "Completed Tasks"];
    
    const csvData = filteredUsers.map((user) => [
      user.assignee_name,
      user.assignee_expLevel,
      user.assignee_role,
      user.total_estimated_hours.toString(),
      user.completed_count
    ]);
    
    csvData.push([
      "TOTAL",
      "",
      "",
      totalHours.toString(),
      totalCompleted.toString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `sound_engineers_overview_${format(new Date(), "yyyy_MM_dd")}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Headphones className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sound Engineers Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Task recording performance and analytics</p>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                  <div className="w-2 bg-blue-500"></div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Total Engineers</div>
                      <div className="p-2 bg-blue-50 rounded-full">
                        <PieChart className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
                      <div className="text-sm text-gray-500 mb-1">sound engineers</div>
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
                      <div className="text-sm font-medium text-gray-500">Completed Tasks</div>
                      <div className="p-2 bg-purple-50 rounded-full">
                        <ClipboardCheck className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {totalCompleted}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">tasks done</div>
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
                        <DollarSign className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="text-3xl font-bold text-gray-900">${totalCommission.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mb-1">total earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
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
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[200px] bg-transparent border-gray-200 rounded-xl h-12">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md p-2 border border-gray-100">
                    <SelectItem 
                      value="all" 
                      className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      All Roles
                    </SelectItem>
                    {uniqueRoles.map(role => (
                      <SelectItem 
                        key={role}
                        value={role} 
                        className="cursor-pointer py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Sound Engineers Table */}
          <Card className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all">
            <CardHeader className="border-b border-gray-100 py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Sound Engineers - Task Recording Overview</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Performance summary of sound engineers with completed tasks
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
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-100/80 rounded-full">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-lg font-medium text-gray-600">No engineers found</p>
                      <p className="text-sm text-gray-500">No sound engineers match your current filters</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="font-semibold text-gray-600">Name</TableHead>
                        <TableHead className="font-semibold text-gray-600">Experience Level</TableHead>
                        <TableHead className="font-semibold text-gray-600">Role</TableHead>
                        <TableHead className="font-semibold text-gray-600">Total Hours</TableHead>
                        <TableHead className="font-semibold text-gray-600">Completed</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, index) => (
                        <TableRow key={index} className="hover:bg-blue-50/5 transition-colors duration-150 group border-b border-gray-100">
                          <TableCell className="font-medium">{user.assignee_name}</TableCell>
                          <TableCell>{user.assignee_expLevel}</TableCell>
                          <TableCell>{user.assignee_role}</TableCell>
                          <TableCell>{user.total_estimated_hours}</TableCell>
                          <TableCell>{user.completed_count}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/Admin/Sound-End/${encodeURIComponent(user.assignee_empId)}`}>
                              <button 
                                className="inline-flex items-center cursor-pointer px-4 py-2 text-sm rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors shadow-sm hover:shadow"
                              >
                                View
                              </button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredUsers.length > 0 && (
                        <TableRow className="bg-gray-50/50 font-medium border-t-2 border-gray-200">
                          <TableCell colSpan={3} className="text-right pr-4 font-bold text-gray-700">
                            Total:
                          </TableCell>
                          <TableCell className="font-bold">
                            {totalHours.toFixed(1)} hrs
                          </TableCell>
                          <TableCell className="font-bold">
                            {totalCompleted} tasks
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
                <Headphones className="h-3.5 w-3.5" />
                <span>Sound engineers performance tracking and task completion overview</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompletedSubtasks;
