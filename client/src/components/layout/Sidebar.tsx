'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  BookOpen,
  Users,
  LayoutDashboard,
  Lock,
  FolderOpen,
  LogOut,
  GraduationCap,
  ClipboardCheck,
  MessageSquare,
  CheckSquare,
  Calendar,
  MessageCircle,
} from 'lucide-react';

const menuItems = {
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/batches', label: 'Batches', icon: FolderOpen },
    { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/standups', label: 'Standups', icon: MessageSquare },
    { href: '/tasks', label: 'Daily Tasks', icon: CheckSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/access', label: 'Access Control', icon: Lock },
    { href: '/discord', label: 'Discord', icon: MessageCircle },
  ],
  MENTOR: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'My Interns', icon: Users },
    { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/standups', label: 'Standups', icon: MessageSquare },
    { href: '/tasks', label: 'Daily Tasks', icon: CheckSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/access', label: 'Access Control', icon: Lock },
    { href: '/discord', label: 'Discord', icon: MessageCircle },
  ],
  INTERN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/curriculum', label: 'My Courses', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/standups', label: 'Standup', icon: MessageSquare },
    { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/discord', label: 'Discord', icon: MessageCircle },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const items = menuItems[user.role] || [];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white border-blue-100 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 border-blue-100">
        <GraduationCap className="h-7 w-7 text-blue-600" />
        <span className="text-lg font-bold text-gray-800">LMS Platform</span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 border-blue-100">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
