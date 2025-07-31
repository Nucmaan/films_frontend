"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Award, Medal, Trophy, Star, TrendingUp, Clock } from "lucide-react";
import clsx from "clsx";

interface PerformerData {
  assignedTo_empId: string;
  assignedTo_name: string;
  completed_count: number;
  total_count: number;
  total_estimated_hours: number;
}

interface TopThreeProps {
  selectedMonth?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_TASK_SERVICE_URL;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getColorFromName(name: string) {
  const colors = ["#ff4e00", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const RANK_CONFIGS = [
  {
    position: 1,
    title: "Champion",
    icon: Trophy,
    colors: {
      primary: "#FFD700",
      secondary: "#FFA500",
      accent: "#FF8C00",
      bg: "from-yellow-50 via-amber-50 to-orange-50",
      border: "border-yellow-200",
      glow: "shadow-yellow-200/50",
      ring: "ring-yellow-300/30",
    },
    scale: "md:scale-110",
    zIndex: "z-30",
  },
  {
    position: 2,
    title: "Runner-up",
    icon: Award,
    colors: {
      primary: "#C0C0C0",
      secondary: "#A8A8A8",
      accent: "#909090",
      bg: "from-slate-50 via-gray-50 to-slate-100",
      border: "border-slate-200",
      glow: "shadow-slate-200/50",
      ring: "ring-slate-300/30",
    },
    scale: "md:scale-105",
    zIndex: "z-20",
  },
  {
    position: 3,
    title: "Third Place",
    icon: Medal,
    colors: {
      primary: "#CD7F32",
      secondary: "#B8860B",
      accent: "#A0522D",
      bg: "from-orange-50 via-amber-50 to-yellow-50",
      border: "border-orange-200",
      glow: "shadow-orange-200/50",
      ring: "ring-orange-300/30",
    },
    scale: "md:scale-100",
    zIndex: "z-10",
  },
];

export default function TopThree({ selectedMonth }: TopThreeProps) {
  const month = selectedMonth || new Date().toISOString().slice(0, 7);
  const apiUrl = `${API_BASE}/api/subtasks/stats/users-completed?month=${month}`;
  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  const topThree = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data]
      .sort((a, b) => {
        if (b.completed_count !== a.completed_count) {
          return b.completed_count - a.completed_count;
        }
        return b.total_estimated_hours - a.total_estimated_hours;
      })
      .slice(0, 3);
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (topThree.length === 0) return <EmptyState />;

  return (
    <section className="relative bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-3xl shadow-sm border border-white/20 backdrop-blur-sm overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ff4e00' fillOpacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

             <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
         <Header />
         <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-center items-stretch max-w-7xl mx-auto">
           {topThree.map((user, idx) => {
             const config = RANK_CONFIGS[idx];
             const avatarColor = getColorFromName(user.assignedTo_name || "user");
             return <PerformerCard key={user.assignedTo_empId} user={user} config={config} avatarColor={avatarColor} index={idx} />;
           })}
         </div>
        <div className="absolute top-4 right-4 opacity-10">
          <Star className="w-8 h-8 text-[#ff4e00]" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <TrendingUp className="w-6 h-6 text-[#ff4e00]" />
        </div>
      </div>
    </section>
  );
}

function PerformerCard({
  user,
  config,
  avatarColor,
  index,
}: {
  user: PerformerData;
  config: (typeof RANK_CONFIGS)[0];
  avatarColor: string;
  index: number;
}) {
  const IconComponent = config.icon;

  return (
         <article
       className={clsx(
         "relative group w-full rounded-2xl border-2 p-4 sm:p-6 md:p-8 flex flex-col items-center",
         "transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-105",
         "bg-gradient-to-br",
         config.colors.bg,
         config.colors.border,
         `shadow-2xl hover:shadow-2xl ${config.colors.glow}`,
         config.scale,
         config.zIndex,
       )}
      style={{
        animationDelay: `${index * 150}ms`,
        animation: "slideUp 0.8s ease-out forwards",
      }}
    >
      {/* Rank Badge */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <div
          className={clsx(
            "relative h-12 w-12 rounded-full flex items-center justify-center",
            "ring-4 ring-white shadow-lg group-hover:shadow-xl transition-all duration-300",
            `hover:${config.colors.ring}`,
          )}
          style={{ backgroundColor: config.colors.primary }}
        >
          <IconComponent className="w-6 h-6 text-white drop-shadow-sm" />

          {/* Glow Effect */}
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-md"
            style={{ backgroundColor: config.colors.primary }}
          />
        </div>
      </div>

      {/* Position Indicator */}
      <div className="absolute -top-3 -right-3">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
          style={{ backgroundColor: config.colors.accent }}
        >
          #{config.position}
        </div>
      </div>

             {/* Avatar */}
       <div className="relative mb-4 sm:mb-6 mt-2 sm:mt-4">
         <div
           className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-inner ring-4 ring-white/50 group-hover:ring-white/80 transition-all duration-300"
           style={{ backgroundColor: avatarColor }}
         >
                     <div className="w-full h-full rounded-full flex items-center justify-center">
             <span className="text-white font-bold text-lg sm:text-xl md:text-2xl drop-shadow-sm">
               {user.assignedTo_name
                 ?.split(" ")
                 .map((n: string) => n[0])
                 .join("")
                 .slice(0, 2) || "U"}
             </span>
           </div>
        </div>
        <div
          className="absolute inset-0 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: avatarColor }}
        />
      </div>

             {/* User Info */}
       <div className="text-center mb-4 sm:mb-6">
         <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 mb-1 group-hover:text-gray-900 transition-colors truncate w-full">
           {user.assignedTo_name}
         </h3>
         <p
           className="text-xs sm:text-sm font-semibold mb-2 px-2 sm:px-3 py-1 rounded-full"
           style={{
             color: config.colors.accent,
             backgroundColor: `${config.colors.primary}15`,
           }}
         >
           {config.title}
         </p>
       </div>

             {/* Metrics */}
       <div className="w-full space-y-2 sm:space-y-4">
         <MetricRow icon={<Award className="w-3 h-3 sm:w-4 sm:h-4" />} label="Completed" value={user.completed_count} color={config.colors.primary} />
         <MetricRow icon={<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />} label="Total Tasks" value={user.total_count ?? user.completed_count} color={config.colors.secondary} />
         <MetricRow icon={<Clock className="w-3 h-3 sm:w-4 sm:h-4" />} label="Actual. Hours" value={Number(user.total_estimated_hours).toFixed(1)} color={config.colors.accent} />
       </div>

             {/* Completion Rate */}
       <div className="w-full mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200/50">
         <div className="flex justify-between items-center mb-2">
           <span className="text-xs font-medium text-gray-600">Completion Rate</span>
           <span className="text-xs font-bold" style={{ color: config.colors.primary }}>
             {Math.round((user.completed_count / (user.total_count || user.completed_count)) * 100)}%
           </span>
         </div>
         <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
           <div
             className="h-full rounded-full transition-all duration-1000 ease-out"
             style={{
               backgroundColor: config.colors.primary,
               width: `${Math.round((user.completed_count / (user.total_count || user.completed_count)) * 100)}%`,
             }}
           />
         </div>
       </div>
    </article>
  );
}

function MetricRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center justify-between p-2 sm:p-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="p-1 sm:p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="font-bold text-sm sm:text-base md:text-lg" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center mb-8 sm:mb-10 md:mb-12">
      <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-[#ff4e00] to-[#ff6b2b] rounded-xl sm:rounded-2xl shadow-lg">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
      </div>
      <h2 className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-3xl bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent mb-2 sm:mb-3">
        Top Performers
      </h2>
      <p className="text-gray-600 text-sm sm:text-base md:text-lg font-medium max-w-md mx-auto px-4">
        Celebrating our most dedicated team members this month
      </p>
      <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#ff4e00] to-[#ff6b2b] rounded-full mx-auto mt-3 sm:mt-4" />
    </div>
  );
}

function LoadingState() {
  return (
    <section className="relative bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-3xl shadow-sm border border-white/20 backdrop-blur-sm overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ff4e00' fillOpacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Header Skeleton */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-[#ff4e00] to-[#ff6b2b] rounded-xl sm:rounded-2xl shadow-lg">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-48 sm:w-64 mx-auto mb-2 sm:mb-3 animate-pulse" />
          <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-64 sm:w-80 mx-auto mb-3 sm:mb-4 animate-pulse" />
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#ff4e00] to-[#ff6b2b] rounded-full mx-auto" />
        </div>

        {/* Cards Skeleton */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-center items-stretch max-w-7xl mx-auto">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="relative group w-full rounded-2xl border-2 p-4 sm:p-6 md:p-8 flex flex-col items-center bg-gradient-to-br from-gray-50 via-white to-gray-50 border-gray-200 shadow-lg"
            >
              {/* Rank Badge Skeleton */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse ring-4 ring-white shadow-lg" />
              </div>

              {/* Position Indicator Skeleton */}
              <div className="absolute -top-3 -right-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse shadow-lg" />
              </div>

              {/* Avatar Skeleton */}
              <div className="relative mb-4 sm:mb-6 mt-2 sm:mt-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gray-200 animate-pulse shadow-inner ring-4 ring-white/50" />
              </div>

              {/* User Info Skeleton */}
              <div className="text-center mb-4 sm:mb-6 w-full">
                <div className="h-5 sm:h-6 bg-gray-200 rounded-lg w-28 sm:w-32 mx-auto mb-2 animate-pulse" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-20 sm:w-24 mx-auto animate-pulse" />
              </div>

              {/* Metrics Skeleton */}
              <div className="w-full space-y-2 sm:space-y-4">
                {[1, 2, 3].map((metricIndex) => (
                  <div key={metricIndex} className="flex items-center justify-between p-2 sm:p-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="p-1 sm:p-1.5 rounded-lg bg-gray-200 w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                      <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-16 sm:w-20 animate-pulse" />
                    </div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded-lg w-10 sm:w-12 animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Progress Bar Skeleton */}
              <div className="w-full mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-3 bg-gray-200 rounded-lg w-20 sm:w-24 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded-lg w-6 sm:w-8 animate-pulse" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full w-1/3 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <Star className="w-8 h-8 text-[#ff4e00]" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <TrendingUp className="w-6 h-6 text-[#ff4e00]" />
        </div>
      </div>
    </section>
  );
}

function ErrorState() {
  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-3xl shadow-xl border border-red-200 p-12">
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-bold text-xl text-red-800 mb-2">Unable to Load</h3>
        <p className="text-red-600">Failed to load top performers data</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-3xl shadow-xl border border-gray-200 p-12">
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-bold text-xl text-gray-700 mb-2">No Data Available</h3>
        <p className="text-gray-500">No performers found for this month</p>
      </div>
    </div>
  );
}
