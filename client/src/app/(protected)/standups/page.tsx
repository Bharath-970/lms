'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { DailyStandup } from '@/types';
import { MessageSquare } from 'lucide-react';

export default function StandupsPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [standups, setStandups] = useState<DailyStandup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ yesterday: '', today: '', blockers: '' });

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSubmittedToday = standups.some((s) => s.date.startsWith(todayStr));

  useEffect(() => {
    loadStandups();
  }, []);

  async function loadStandups() {
    try {
      const endpoint = isIntern ? '/standups/me' : '/standups/today';
      const { data } = await api.get(endpoint);
      setStandups(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/standups', form);
      setForm({ yesterday: '', today: '', blockers: '' });
      await loadStandups();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isIntern ? 'Daily Standup' : "Today's Standups"}
      </h1>

      {isIntern && !hasSubmittedToday && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Submit Standup</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">What did you do yesterday?</label>
              <textarea
                value={form.yesterday}
                onChange={(e) => setForm({ ...form, yesterday: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">What will you do today?</label>
              <textarea
                value={form.today}
                onChange={(e) => setForm({ ...form, today: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Any blockers?</label>
              <textarea
                value={form.blockers}
                onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                rows={2}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Standup'}
          </button>
        </form>
      )}

      {isIntern && hasSubmittedToday && (
        <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">Standup submitted for today</p>
        </div>
      )}

      <div className="space-y-4">
        {standups.map((standup) => (
          <div key={standup.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                {standup.intern && (
                  <span className="text-sm font-semibold text-gray-900">{standup.intern.name}</span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(standup.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">Yesterday</p>
                <p className="mt-1 text-sm text-gray-700">{standup.yesterday}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">Today</p>
                <p className="mt-1 text-sm text-gray-700">{standup.today}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">Blockers</p>
                <p className="mt-1 text-sm text-gray-700">{standup.blockers || 'None'}</p>
              </div>
            </div>
          </div>
        ))}
        {standups.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No standups yet</p>
        )}
      </div>
    </div>
  );
}
