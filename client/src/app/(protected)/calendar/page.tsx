'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Attendance } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  PRESENT: 'bg-green-400',
  LATE: 'bg-yellow-400',
  INCOMPLETE: 'bg-orange-400',
  ABSENT: 'bg-red-400',
  EXCUSED: 'bg-blue-400',
};

export default function CalendarPage() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadAttendance();
  }, [year, month]);

  async function loadAttendance() {
    setLoading(true);
    try {
      const endpoint =
        user?.role === 'INTERN'
          ? `/attendance/me?month=${month + 1}&year=${year}`
          : `/attendance?date=`;
      const { data } = await api.get(endpoint);
      setAttendance(data.data);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const attendanceMap = new Map<string, Attendance>();
  attendance.forEach((a) => {
    const dateStr = new Date(a.date).toISOString().split('T')[0];
    attendanceMap.set(dateStr, a);
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Calendar</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
          <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium uppercase text-gray-400">
              {day}
            </div>
          ))}

          {days.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-20" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendanceMap.get(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayOfWeek = new Date(year, month, day).getDay();
            const isSunday = dayOfWeek === 0;

            return (
              <div
                key={day}
                className={`relative h-20 rounded-lg border p-1.5 ${
                  isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-100'
                } ${isSunday ? 'bg-gray-50' : ''}`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {day}
                </span>
                {record && (
                  <div className="mt-1">
                    <div className={`h-2 w-2 rounded-full ${statusColors[record.status]}`} />
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {record.tasksCompletedCount}/{record.tasksTotalCount}
                    </p>
                  </div>
                )}
                {isSunday && <span className="absolute bottom-1 right-1 text-[9px] text-gray-400">Off</span>}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
              <span className="text-xs text-gray-500">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
