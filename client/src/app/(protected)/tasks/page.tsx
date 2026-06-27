'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { DailyTask, User } from '@/types';
import { CheckSquare, Plus, Clock, Circle, CheckCircle } from 'lucide-react';

const taskStatusConfig: Record<string, { color: string; icon: typeof Circle }> = {
  PENDING: { color: 'text-gray-400', icon: Circle },
  IN_PROGRESS: { color: 'text-blue-500', icon: Clock },
  COMPLETED: { color: 'text-green-500', icon: CheckCircle },
};

export default function TasksPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ internId: '', title: '', description: '' });
  const [interns, setInterns] = useState<User[]>([]);
  const [selectedIntern, setSelectedIntern] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      if (isIntern) {
        const { data } = await api.get('/daily-tasks/me');
        setTasks(data.data);
      } else {
        const { data: usersData } = await api.get('/users');
        const internsList = usersData.data.filter((u: User) => u.role === 'INTERN');
        setInterns(internsList);
        if (internsList.length > 0) {
          const first = internsList[0].id;
          setSelectedIntern(first);
          const { data } = await api.get(`/daily-tasks/intern/${first}`);
          setTasks(data.data);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadInternTasks(internId: string) {
    setSelectedIntern(internId);
    const { data } = await api.get(`/daily-tasks/intern/${internId}`);
    setTasks(data.data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/daily-tasks', form);
      setShowForm(false);
      setForm({ internId: '', title: '', description: '' });
      if (selectedIntern) await loadInternTasks(selectedIntern);
    } catch {
      // handled
    } finally {
      setCreating(false);
    }
  }

  async function updateStatus(taskId: string, status: string) {
    await api.patch(`/daily-tasks/${taskId}/status`, { status });
    if (isIntern) {
      const { data } = await api.get('/daily-tasks/me');
      setTasks(data.data);
    } else if (selectedIntern) {
      await loadInternTasks(selectedIntern);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isIntern ? "Today's Tasks" : 'Daily Tasks'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {completedCount}/{tasks.length} completed
          </p>
        </div>
        {!isIntern && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Assign Task
          </button>
        )}
      </div>

      {!isIntern && interns.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {interns.map((intern) => (
            <button
              key={intern.id}
              onClick={() => loadInternTasks(intern.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedIntern === intern.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {intern.name}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <select
              value={form.internId}
              onChange={(e) => setForm({ ...form, internId: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            >
              <option value="">Select Intern</option>
              {interns.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            />
          </div>
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
            rows={2}
          />
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Assigning...' : 'Assign'}
          </button>
        </form>
      )}

      {tasks.length > 0 && (
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => {
          const cfg = taskStatusConfig[task.status];
          const Icon = cfg.icon;
          return (
            <div
              key={task.id}
              className={`flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 ${
                task.status === 'COMPLETED' ? 'opacity-60' : ''
              }`}
            >
              {isIntern ? (
                <button
                  onClick={() =>
                    updateStatus(
                      task.id,
                      task.status === 'COMPLETED'
                        ? 'PENDING'
                        : task.status === 'PENDING'
                          ? 'IN_PROGRESS'
                          : 'COMPLETED'
                    )
                  }
                  className="flex-shrink-0"
                >
                  <Icon className={`h-6 w-6 ${cfg.color}`} />
                </button>
              ) : (
                <CheckSquare className={`h-5 w-5 flex-shrink-0 ${cfg.color}`} />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="mt-0.5 text-xs text-gray-500">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {task.dueTime && (
                  <span>Due {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                )}
                {task.assigner && <span>by {task.assigner.name}</span>}
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No tasks assigned for today</p>
        )}
      </div>
    </div>
  );
}
