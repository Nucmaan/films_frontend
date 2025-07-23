"use client";

import React, { useState } from 'react';
import { BiBell, BiX, BiSearch, BiEnvelopeOpen } from 'react-icons/bi';
import { useNotifications } from '@/lib/notification/page';
import NotificationsSkeleton from '@/components/NotificationsSkeleton';

interface Notification {
  id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
  time?: string;
}

export default function NotificationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { notifications, isLoading, isError, meta } = useNotifications(page);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const filteredNotifications = (notifications as Notification[])
    .filter((n) =>
      search
        ? n.message.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .map((n) => ({
      ...n,
      time: formatTimeAgo(n.created_at),
    }));

  return (
    <div className="w-full h-full min-h-screen bg-gray-50">
      <div className="max-w-[1500px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated with all your important alerts and messages</p>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="relative w-full lg:w-auto lg:flex-1 lg:max-w-md">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notifications..."
              className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:border-[#ff4e00] focus:ring-2 focus:ring-[#fff1ec] transition-all outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <NotificationsSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="bg-rose-100 p-4 rounded-full mb-4">
                <BiX className="text-rose-600" size={28} />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">Error loading notifications</h3>
              <p className="text-gray-500 text-sm text-center px-4">Failed to load notifications</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 transition-colors duration-200 hover:bg-gray-50 relative"
                >
                  <div className="flex-shrink-0">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <BiBell className="text-gray-600" size={18} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-gray-900">
                      {n.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <p className="text-xs text-gray-400">
                        {n.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <BiEnvelopeOpen className="text-gray-400" size={28} />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No notifications found</h3>
              <p className="text-gray-500 text-sm text-center px-4">
                {search ? `No results for "${search}"` : 'You don\'t have any notifications'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!meta.hasPrevious}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNext}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
