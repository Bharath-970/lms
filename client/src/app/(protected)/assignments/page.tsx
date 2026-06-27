'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Assignment } from '@/types';
import { FileText, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AssignmentsPage() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    maxScore: 100,
    deadline: '',
    fileTypes: '.py,.ipynb,.pdf',
    allowResubmit: true,
    maxResubmits: 2,
    isMiniProject: false,
  });

  useEffect(() => {
    api.get('/assignments').then((res) => {
      setAssignments(res.data.data);
      setLoading(false);
    });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/assignments', form);
      setShowForm(false);
      setForm({ title: '', description: '', maxScore: 100, deadline: '', fileTypes: '.py,.ipynb,.pdf', allowResubmit: true, maxResubmits: 2, isMiniProject: false });
      const res = await api.get('/assignments');
      setAssignments(res.data.data);
    } catch {
      // handled
    } finally {
      setCreating(false);
    }
  }

  function deadlineStatus(deadline: string) {
    const now = new Date();
    const dl = new Date(deadline);
    const diff = dl.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Closed', color: 'text-red-500', icon: AlertCircle };
    if (days <= 2) return { label: `${days}d left`, color: 'text-orange-500', icon: Clock };
    return { label: `${days}d left`, color: 'text-green-500', icon: CheckCircle };
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">{assignments.length} assignments</p>
        </div>
        {user?.role !== 'INTERN' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Assignment
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Max Score"
              value={form.maxScore}
              onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            />
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="File types (.py,.pdf)"
              value={form.fileTypes}
              onChange={(e) => setForm({ ...form, fileTypes: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
            rows={3}
            required
          />
          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.allowResubmit}
                onChange={(e) => setForm({ ...form, allowResubmit: e.target.checked })}
                className="rounded border-gray-300"
              />
              Allow resubmit
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isMiniProject}
                onChange={(e) => setForm({ ...form, isMiniProject: e.target.checked })}
                className="rounded border-gray-300"
              />
              Mini Project
            </label>
            {form.allowResubmit && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Max resubmits:
                <input
                  type="number"
                  value={form.maxResubmits}
                  onChange={(e) => setForm({ ...form, maxResubmits: Number(e.target.value) })}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  min={1}
                />
              </label>
            )}
          </div>
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {assignments.map((a) => {
          const dl = deadlineStatus(a.deadline);
          const DlIcon = dl.icon;
          return (
            <Link
              key={a.id}
              href={`/assignments/${a.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${a.isMiniProject ? 'bg-purple-50' : 'bg-blue-50'}`}>
                  <FileText className={`h-6 w-6 ${a.isMiniProject ? 'text-purple-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {a.isMiniProject && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Mini Project
                      </span>
                    )}
                    {a.module?.course && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Week {a.module.course.weekNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-gray-900">{a.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Max: {a.maxScore} pts &middot; Due: {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {a._count?.submissions || 0} submissions
                </span>
                <div className={`flex items-center gap-1 ${dl.color}`}>
                  <DlIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">{dl.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
        {assignments.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No assignments yet</p>
        )}
      </div>
    </div>
  );
}
