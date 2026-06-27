'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Attendance, User } from '@/types';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  PRESENT: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Present' },
  LATE: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Late' },
  INCOMPLETE: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle, label: 'Incomplete' },
  ABSENT: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Absent' },
  EXCUSED: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Excused' },
};

export default function AttendancePage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [allToday, setAllToday] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const [overrideForm, setOverrideForm] = useState({ internId: '', status: 'PRESENT' as string, reason: '' });
  const [showOverride, setShowOverride] = useState(false);
  const [interns, setInterns] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      if (isIntern) {
        const { data } = await api.get('/attendance/me');
        setHistory(data.data);
        const today = new Date().toISOString().split('T')[0];
        const todayRec = data.data.find((a: Attendance) => a.date.startsWith(today));
        setTodayRecord(todayRec || null);
      } else {
        const [todayRes, usersRes] = await Promise.all([
          api.get('/attendance/today'),
          api.get('/users'),
        ]);
        setAllToday(todayRes.data.data);
        setInterns(usersRes.data.data.filter((u: User) => u.role === 'INTERN'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMark() {
    setMarking(true);
    try {
      await api.post('/attendance/mark');
      await loadData();
    } catch {
      // handled by interceptor
    } finally {
      setMarking(false);
    }
  }

  async function handleOverride(e: React.FormEvent) {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/attendance/override', { ...overrideForm, date: today });
      setShowOverride(false);
      setOverrideForm({ internId: '', status: 'PRESENT', reason: '' });
      await loadData();
    } catch {
      // handled
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isIntern) {
    const now = new Date();
    const istMins = (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % 1440;
    const canMark = istMins >= 570 && istMins <= 660 && !todayRecord;

    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Attendance</h1>

        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Today</h2>
          {todayRecord ? (
            <div className="flex items-center gap-3">
              {(() => {
                const cfg = statusConfig[todayRecord.status];
                const Icon = cfg.icon;
                return (
                  <>
                    <Icon className="h-6 w-6" />
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      Marked at {todayRecord.markedAt ? new Date(todayRecord.markedAt).toLocaleTimeString() : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Tasks: {todayRecord.tasksCompletedCount}/{todayRecord.tasksTotalCount}
                    </span>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">
                {canMark
                  ? 'Attendance window is open (9:30 AM - 11:00 AM)'
                  : istMins < 570
                    ? 'Attendance window opens at 9:30 AM'
                    : 'Attendance window closed'}
              </p>
              {canMark && (
                <button
                  onClick={handleMark}
                  disabled={marking}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {marking ? 'Marking...' : 'Mark Present'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <h2 className="border-b border-gray-200 px-6 py-4 text-lg font-semibold text-gray-800">History</h2>
          <div className="divide-y divide-gray-100">
            {history.map((record) => {
              const cfg = statusConfig[record.status];
              return (
                <div key={record.id} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm text-gray-700">
                    {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {record.tasksCompletedCount}/{record.tasksTotalCount} tasks
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {history.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No records yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mentor/Admin view
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">Today&apos;s attendance overview</p>
        </div>
        <button
          onClick={() => setShowOverride(!showOverride)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Override Attendance
        </button>
      </div>

      {showOverride && (
        <form onSubmit={handleOverride} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <select
              value={overrideForm.internId}
              onChange={(e) => setOverrideForm({ ...overrideForm, internId: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            >
              <option value="">Select Intern</option>
              {interns.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <select
              value={overrideForm.status}
              onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="EXCUSED">Excused</option>
              <option value="ABSENT">Absent</option>
            </select>
            <input
              type="text"
              placeholder="Reason"
              value={overrideForm.reason}
              onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Override
          </button>
        </form>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((status) => {
          const count = allToday.filter((a) => a.status === status).length;
          const cfg = statusConfig[status];
          return (
            <div key={status} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`mt-1 text-xs font-medium ${cfg.color} inline-block rounded-full px-2 py-0.5`}>
                {cfg.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Intern</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Marked At</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tasks</th>
            </tr>
          </thead>
          <tbody>
            {allToday.map((record) => {
              const cfg = statusConfig[record.status];
              return (
                <tr key={record.id} className="border-b border-gray-100">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.intern?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.tasksCompletedCount}/{record.tasksTotalCount}
                  </td>
                </tr>
              );
            })}
            {allToday.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                  No attendance records for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
