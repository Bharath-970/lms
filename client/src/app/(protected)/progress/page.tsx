'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { PeerReview, WeeklyReport, MentorEvaluation, ProgressStats, User } from '@/types';
import { BarChart3, Users as UsersIcon, Star, FileText, TrendingUp } from 'lucide-react';

type Tab = 'dashboard' | 'peer-reviews' | 'reports' | 'evaluations';

export default function ProgressPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';
  const [tab, setTab] = useState<Tab>('dashboard');

  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [recentEvals, setRecentEvals] = useState<MentorEvaluation[]>([]);
  const [recentPeerReviews, setRecentPeerReviews] = useState<PeerReview[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);

  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [allReports, setAllReports] = useState<WeeklyReport[]>([]);
  const [evaluations, setEvaluations] = useState<MentorEvaluation[]>([]);

  const [interns, setInterns] = useState<User[]>([]);
  const [selectedIntern, setSelectedIntern] = useState('');

  // Peer review form
  const [showPeerForm, setShowPeerForm] = useState(false);
  const [peerForm, setPeerForm] = useState({ revieweeId: '', weekNumber: 1, strengths: '', improvements: '' });

  // Report generation
  const [reportForm, setReportForm] = useState({ internId: '', weekNumber: 1 });

  // Evaluation form
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [evalForm, setEvalForm] = useState({ internId: '', weekNumber: 1, technicalScore: 5, softSkillScore: 5, attendanceScore: 5, feedback: '', areasOfImprovement: '' });

  // Mentor comment
  const [commenting, setCommenting] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({ mentorComments: '', overallScore: 0 });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    if (!isIntern) {
      api.get('/users?role=INTERN').then((r) => setInterns(r.data.data || []));
    }
  }, []);

  useEffect(() => {
    if (tab === 'peer-reviews') loadPeerReviews();
    if (tab === 'reports') loadReports();
    if (tab === 'evaluations') loadEvaluations();
  }, [tab, selectedIntern]);

  async function loadDashboard() {
    const targetId = selectedIntern || undefined;
    const url = targetId ? `/progress/dashboard/${targetId}` : '/progress/dashboard';
    const res = await api.get(url);
    setStats(res.data.data.stats);
    setRecentEvals(res.data.data.recentEvaluations);
    setRecentPeerReviews(res.data.data.recentPeerReviews);
    setWeeklyReports(res.data.data.weeklyReports);
    setLoading(false);
  }

  async function loadPeerReviews() {
    const params = selectedIntern ? `?revieweeId=${selectedIntern}` : '';
    const res = await api.get(`/progress/peer-reviews${params}`);
    setPeerReviews(res.data.data);
  }

  async function loadReports() {
    const params = selectedIntern ? `?internId=${selectedIntern}` : '';
    const res = await api.get(`/progress/weekly-reports${params}`);
    setAllReports(res.data.data);
  }

  async function loadEvaluations() {
    const params = selectedIntern ? `?internId=${selectedIntern}` : '';
    const res = await api.get(`/progress/evaluations${params}`);
    setEvaluations(res.data.data);
  }

  async function handlePeerReview(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/progress/peer-reviews', peerForm);
    setShowPeerForm(false);
    setPeerForm({ revieweeId: '', weekNumber: 1, strengths: '', improvements: '' });
    loadPeerReviews();
  }

  async function handleGenerateReport(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/progress/weekly-reports', { internId: reportForm.internId || undefined, weekNumber: reportForm.weekNumber });
    loadReports();
  }

  async function handleEvaluation(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/progress/evaluations', evalForm);
    setShowEvalForm(false);
    setEvalForm({ internId: '', weekNumber: 1, technicalScore: 5, softSkillScore: 5, attendanceScore: 5, feedback: '', areasOfImprovement: '' });
    loadEvaluations();
  }

  async function handleMentorComment(id: string) {
    await api.put(`/progress/weekly-reports/${id}/comment`, commentForm);
    setCommenting(null);
    loadReports();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'peer-reviews', label: 'Peer Reviews', icon: UsersIcon },
    { key: 'reports', label: 'Weekly Reports', icon: FileText },
    { key: 'evaluations', label: 'Evaluations', icon: Star },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress & Evaluation</h1>
          <p className="mt-1 text-sm text-gray-500">Track performance and growth</p>
        </div>
        {!isIntern && (
          <select value={selectedIntern} onChange={(e) => { setSelectedIntern(e.target.value); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Interns</option>
            {interns.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && stats && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Attendance" value={`${stats.attendanceRate}%`} sub={`${stats.presentDays}/${stats.totalDays} days`} color="blue" />
            <StatCard label="Tasks" value={`${stats.taskCompletionRate}%`} sub={`${stats.completedTasks}/${stats.totalTasks}`} color="green" />
            <StatCard label="Avg Grade" value={stats.avgGrade.toString()} sub={`${stats.gradedSubmissions} graded`} color="purple" />
            <StatCard label="Commits" value={stats.commitCount.toString()} sub={`${stats.quizzesTaken} quizzes`} color="amber" />
          </div>

          {recentEvals.length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-800">Recent Evaluations</h2>
              <div className="space-y-3">
                {recentEvals.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Week {ev.weekNumber}</span>
                      <span className="ml-2 text-xs text-gray-400">by {ev.mentor?.name}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">Tech: {ev.technicalScore}</span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">Soft: {ev.softSkillScore}</span>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">Overall: {ev.overallScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentPeerReviews.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-800">Recent Peer Reviews</h2>
              <div className="space-y-3">
                {recentPeerReviews.map((pr) => (
                  <div key={pr.id} className="rounded-lg bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Week {pr.weekNumber} — by {pr.reviewer?.name}</span>
                    </div>
                    {pr.strengths && <p className="mt-1 text-xs text-green-600">Strengths: {pr.strengths}</p>}
                    {pr.improvements && <p className="mt-0.5 text-xs text-amber-600">Improve: {pr.improvements}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Peer Reviews Tab */}
      {tab === 'peer-reviews' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button onClick={() => setShowPeerForm(!showPeerForm)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Write Review
            </button>
          </div>

          {showPeerForm && (
            <form onSubmit={handlePeerReview} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select value={peerForm.revieweeId} onChange={(e) => setPeerForm({ ...peerForm, revieweeId: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" required>
                  <option value="">Select intern...</option>
                  {interns.filter((i) => i.id !== user?.id).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input type="number" placeholder="Week #" value={peerForm.weekNumber} onChange={(e) => setPeerForm({ ...peerForm, weekNumber: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" min={1} required />
              </div>
              <textarea placeholder="Strengths observed..." value={peerForm.strengths} onChange={(e) => setPeerForm({ ...peerForm, strengths: e.target.value })} className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" rows={2} />
              <textarea placeholder="Areas for improvement..." value={peerForm.improvements} onChange={(e) => setPeerForm({ ...peerForm, improvements: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" rows={2} />
              <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Submit Review</button>
            </form>
          )}

          <div className="space-y-3">
            {peerReviews.map((pr) => (
              <div key={pr.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{pr.reviewer?.name}</span>
                    <span className="mx-2 text-gray-300">→</span>
                    <span className="text-sm text-gray-600">{pr.reviewee?.name}</span>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Week {pr.weekNumber}</span>
                </div>
                {pr.strengths && <p className="mt-2 text-sm text-green-700"><strong>Strengths:</strong> {pr.strengths}</p>}
                {pr.improvements && <p className="mt-1 text-sm text-amber-700"><strong>Improve:</strong> {pr.improvements}</p>}
                {pr.assignment && <p className="mt-1 text-xs text-gray-400">Assignment: {pr.assignment.title}</p>}
              </div>
            ))}
            {peerReviews.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No peer reviews yet</p>}
          </div>
        </div>
      )}

      {/* Weekly Reports Tab */}
      {tab === 'reports' && (
        <div>
          <form onSubmit={handleGenerateReport} className="mb-6 flex items-end gap-3">
            {!isIntern && (
              <select value={reportForm.internId} onChange={(e) => setReportForm({ ...reportForm, internId: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Myself</option>
                {interns.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            )}
            <input type="number" placeholder="Week #" value={reportForm.weekNumber} onChange={(e) => setReportForm({ ...reportForm, weekNumber: Number(e.target.value) })} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" min={1} />
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Generate Report</button>
          </form>

          <div className="space-y-4">
            {allReports.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Week {r.weekNumber}</h3>
                    <p className="text-xs text-gray-400">{r.intern?.name} — {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  {r.overallScore !== null && <span className="text-xl font-bold text-blue-600">{r.overallScore}</span>}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  <MiniStat label="Present" value={`${r.summaryJson.presentDays}/${r.summaryJson.attendanceDays}`} />
                  <MiniStat label="Standups" value={r.summaryJson.standupCount.toString()} />
                  <MiniStat label="Tasks" value={`${r.summaryJson.completedTasks}/${r.summaryJson.totalTasks}`} />
                  <MiniStat label="Avg Grade" value={r.summaryJson.avgGrade.toString()} />
                  <MiniStat label="Commits" value={r.summaryJson.commitCount.toString()} />
                </div>

                {r.mentorComments && (
                  <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <strong>Mentor:</strong> {r.mentorComments}
                  </div>
                )}

                {!isIntern && !r.mentorComments && (
                  <div className="mt-3">
                    {commenting === r.id ? (
                      <div className="flex gap-2">
                        <input type="text" placeholder="Comment..." value={commentForm.mentorComments} onChange={(e) => setCommentForm({ ...commentForm, mentorComments: e.target.value })} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        <input type="number" placeholder="Score" value={commentForm.overallScore} onChange={(e) => setCommentForm({ ...commentForm, overallScore: Number(e.target.value) })} className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm" min={0} max={100} />
                        <button onClick={() => handleMentorComment(r.id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Save</button>
                      </div>
                    ) : (
                      <button onClick={() => { setCommenting(r.id); setCommentForm({ mentorComments: '', overallScore: 0 }); }} className="text-xs text-blue-600 hover:text-blue-700">Add Comment</button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {allReports.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No weekly reports yet</p>}
          </div>
        </div>
      )}

      {/* Evaluations Tab */}
      {tab === 'evaluations' && (
        <div>
          {!isIntern && (
            <div className="mb-4 flex justify-end">
              <button onClick={() => setShowEvalForm(!showEvalForm)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                New Evaluation
              </button>
            </div>
          )}

          {showEvalForm && (
            <form onSubmit={handleEvaluation} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <select value={evalForm.internId} onChange={(e) => setEvalForm({ ...evalForm, internId: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" required>
                  <option value="">Select intern...</option>
                  {interns.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input type="number" placeholder="Week #" value={evalForm.weekNumber} onChange={(e) => setEvalForm({ ...evalForm, weekNumber: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" min={1} required />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Technical (0-10)</label>
                  <input type="number" value={evalForm.technicalScore} onChange={(e) => setEvalForm({ ...evalForm, technicalScore: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" min={0} max={10} step={0.5} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Soft Skills (0-10)</label>
                  <input type="number" value={evalForm.softSkillScore} onChange={(e) => setEvalForm({ ...evalForm, softSkillScore: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" min={0} max={10} step={0.5} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Attendance (0-10)</label>
                  <input type="number" value={evalForm.attendanceScore} onChange={(e) => setEvalForm({ ...evalForm, attendanceScore: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" min={0} max={10} step={0.5} />
                </div>
              </div>
              <textarea placeholder="Overall feedback..." value={evalForm.feedback} onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })} className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" rows={2} />
              <textarea placeholder="Areas of improvement..." value={evalForm.areasOfImprovement} onChange={(e) => setEvalForm({ ...evalForm, areasOfImprovement: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" rows={2} />
              <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Submit Evaluation</button>
            </form>
          )}

          <div className="space-y-3">
            {evaluations.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{ev.intern?.name}</span>
                    <span className="ml-2 text-xs text-gray-400">Week {ev.weekNumber} — by {ev.mentor?.name}</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{ev.overallScore}/10</span>
                </div>
                <div className="mt-3 flex gap-3 text-xs">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">Technical: {ev.technicalScore}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">Soft Skills: {ev.softSkillScore}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Attendance: {ev.attendanceScore}</span>
                </div>
                {ev.feedback && <p className="mt-3 text-sm text-gray-600">{ev.feedback}</p>}
                {ev.areasOfImprovement && <p className="mt-1 text-sm text-amber-700"><strong>Improve:</strong> {ev.areasOfImprovement}</p>}
              </div>
            ))}
            {evaluations.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No evaluations yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[color]?.split(' ')[1] || 'text-gray-900'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-700">{value}</p>
    </div>
  );
}
