'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { Notification as Notif } from '@/types';
import {
  BookOpen, Users, FolderOpen, ClipboardCheck, FileText,
  Brain, GitBranch, Trophy, Zap, Award, Flame, Bell, Check,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  stats: Record<string, number | string | boolean | null>;
  notifications?: Notif[];
  recentUsers?: { id: string; name: string; email: string; role: string; status: string; createdAt: string }[];
  todayAttendance?: { status: string; intern?: { id: string; name: string } }[];
  recentStandups?: { internId: string; yesterday: string; today: string; intern?: { id: string; name: string } }[];
  recentSubmissions?: { id: string; status: string; grade: number | null; assignment?: { title: string; maxScore: number } }[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const endpoint = user?.role === 'ADMIN' ? '/dashboard/admin'
          : user?.role === 'MENTOR' ? '/dashboard/mentor'
          : '/dashboard/intern';
        const res = await api.get(endpoint);
        setData(res.data.data);
      } catch { /* handled */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.role]);

  async function markAllRead() {
    await api.put('/dashboard/notifications/read');
    const endpoint = user?.role === 'ADMIN' ? '/dashboard/admin'
      : user?.role === 'MENTOR' ? '/dashboard/mentor'
      : '/dashboard/intern';
    const res = await api.get(endpoint);
    setData(res.data.data);
  }

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const s = data.stats;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {user?.role === 'ADMIN' ? 'Admin Dashboard' : user?.role === 'MENTOR' ? 'Mentor Dashboard' : 'Your Learning Dashboard'}
      </p>

      {/* Admin Dashboard */}
      {user?.role === 'ADMIN' && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} label="Total Users" value={s.totalUsers as number} bg="bg-blue-50" />
            <StatCard icon={<FolderOpen className="h-5 w-5 text-indigo-500" />} label="Active Batches" value={s.activeBatches as number} bg="bg-indigo-50" />
            <StatCard icon={<BookOpen className="h-5 w-5 text-green-500" />} label="Courses" value={s.courses as number} bg="bg-green-50" />
            <StatCard icon={<FileText className="h-5 w-5 text-amber-500" />} label="Pending Submissions" value={s.pendingSubmissions as number} bg="bg-amber-50" />
          </div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniStat label="Admins" value={s.admins as number} />
            <MiniStat label="Mentors" value={s.mentors as number} />
            <MiniStat label="Interns" value={s.interns as number} />
            <MiniStat label="Present Today" value={`${s.presentToday}/${s.totalToday}`} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickLinks role="ADMIN" />
            {data.recentUsers && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">Recent Users</h3>
                <div className="space-y-2">
                  {data.recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{u.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'MENTOR' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mentor Dashboard */}
      {user?.role === 'MENTOR' && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} label="My Interns" value={s.menteeCount as number} bg="bg-blue-50" />
            <StatCard icon={<ClipboardCheck className="h-5 w-5 text-green-500" />} label="Present Today" value={`${s.presentToday}/${s.totalToday}`} bg="bg-green-50" />
            <StatCard icon={<FileText className="h-5 w-5 text-amber-500" />} label="Pending Reviews" value={(s.pendingSubmissions as number) + (s.pendingReviews as number)} bg="bg-amber-50" />
            <StatCard icon={<Brain className="h-5 w-5 text-purple-500" />} label="Standups Today" value={s.standupsDone as number} bg="bg-purple-50" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickLinks role="MENTOR" />
            {data.todayAttendance && data.todayAttendance.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">Today&apos;s Attendance</h3>
                <div className="space-y-2">
                  {data.todayAttendance.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{a.intern?.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === 'PRESENT' ? 'bg-green-100 text-green-700' : a.status === 'LATE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intern Dashboard */}
      {user?.role === 'INTERN' && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<ClipboardCheck className="h-5 w-5 text-blue-500" />} label="Attendance" value={`${s.attendanceRate}%`} bg="bg-blue-50" />
            <StatCard icon={<Zap className="h-5 w-5 text-amber-500" />} label="Total XP" value={s.totalXp as number} bg="bg-amber-50" />
            <StatCard icon={<Award className="h-5 w-5 text-purple-500" />} label="Badges" value={s.badgeCount as number} bg="bg-purple-50" />
            <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Streak" value={`${s.currentStreak} days`} bg="bg-orange-50" />
          </div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <MiniStat label="Today Tasks" value={`${s.completedTasks}/${s.todayTasks}`} />
            <MiniStat label="Submissions" value={s.totalSubmissions as number} />
            <MiniStat label="Quiz Attempts" value={s.quizAttempts as number} />
            <MiniStat label="Commits" value={s.commits as number} />
            <MiniStat label="Capstone" value={(s.capstonePhase as string) || 'Not started'} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickLinks role="INTERN" />
            {data.recentSubmissions && data.recentSubmissions.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">Recent Submissions</h3>
                <div className="space-y-2">
                  {data.recentSubmissions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{sub.assignment?.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${sub.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {sub.status === 'GRADED' ? `${sub.grade}/${sub.assignment?.maxScore}` : sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {data.notifications && data.notifications.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            </div>
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              <Check className="h-3 w-3" /> Mark all read
            </button>
          </div>
          <div className="space-y-2">
            {data.notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`flex items-start gap-3 rounded-lg px-3 py-2 text-sm ${n.read ? 'text-gray-400' : 'bg-blue-50 text-gray-700'}`}>
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs">{n.message}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number | string; bg: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
        <div>
          <p className="text-xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-700">{typeof value === 'number' ? value : value}</p>
    </div>
  );
}

function QuickLinks({ role }: { role: string }) {
  const links = role === 'ADMIN' ? [
    { href: '/users', label: 'Manage Users', icon: Users },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/progress', label: 'Progress Reports', icon: ClipboardCheck },
    { href: '/gamification', label: 'Gamification', icon: Award },
  ] : role === 'MENTOR' ? [
    { href: '/assignments', label: 'Grade Work', icon: FileText },
    { href: '/progress', label: 'Student Progress', icon: ClipboardCheck },
    { href: '/github', label: 'Code Reviews', icon: GitBranch },
    { href: '/hackathons', label: 'Hackathons', icon: Trophy },
  ] : [
    { href: '/attendance', label: 'Mark Attendance', icon: ClipboardCheck },
    { href: '/tasks', label: 'Daily Tasks', icon: FileText },
    { href: '/gamification', label: 'Badges & XP', icon: Award },
    { href: '/playground', label: 'Code Playground', icon: Brain },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              <Icon className="h-4 w-4" /> {l.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
