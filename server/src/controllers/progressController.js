const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Peer Reviews ────────────────────────────────────

async function createPeerReview(req, res) {
  try {
    const { revieweeId, assignmentId, weekNumber, scoresJson, strengths, improvements } = req.body;
    const review = await prisma.peerReview.create({
      data: {
        reviewerId: req.user.id,
        revieweeId,
        assignmentId: assignmentId || null,
        weekNumber,
        scoresJson: scoresJson || null,
        strengths: strengths || null,
        improvements: improvements || null,
        status: 'COMPLETED',
      },
      include: { reviewer: { select: { id: true, name: true } }, reviewee: { select: { id: true, name: true } } },
    });
    await prisma.notification.create({
      data: { userId: revieweeId, type: 'PEER_REVIEW', title: 'New Peer Review', message: `${req.user.name} reviewed your work for week ${weekNumber}`, link: '/progress' },
    });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function getPeerReviews(req, res) {
  try {
    const where = {};
    if (req.query.revieweeId) where.revieweeId = req.query.revieweeId;
    if (req.query.reviewerId) where.reviewerId = req.query.reviewerId;
    if (req.query.weekNumber) where.weekNumber = parseInt(req.query.weekNumber);
    if (req.user.role === 'INTERN') {
      where.OR = [{ reviewerId: req.user.id }, { revieweeId: req.user.id }];
    }
    const reviews = await prisma.peerReview.findMany({
      where,
      include: {
        reviewer: { select: { id: true, name: true } },
        reviewee: { select: { id: true, name: true } },
        assignment: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// ─── Weekly Reports ──────────────────────────────────

async function generateWeeklyReport(req, res) {
  try {
    const { internId, weekNumber } = req.body;
    const targetId = internId || req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - ((weekNumber || 1) * 7));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const [attendance, standups, tasks, submissions, quizAttempts, commits] = await Promise.all([
      prisma.attendance.findMany({ where: { internId: targetId, date: { gte: startDate, lt: endDate } } }),
      prisma.dailyStandup.findMany({ where: { internId: targetId, date: { gte: startDate, lt: endDate } } }),
      prisma.dailyTask.findMany({ where: { internId: targetId, date: { gte: startDate, lt: endDate } } }),
      prisma.submission.findMany({ where: { internId: targetId, submittedAt: { gte: startDate, lt: endDate } }, include: { assignment: { select: { title: true, maxScore: true } } } }),
      prisma.quizAttempt.findMany({ where: { internId: targetId, startedAt: { gte: startDate, lt: endDate } }, include: { quiz: { select: { title: true, maxScore: true } } } }),
      prisma.commitLog.findMany({ where: { internId: targetId, date: { gte: startDate, lt: endDate } } }),
    ]);

    const presentDays = attendance.filter((a) => ['PRESENT', 'LATE'].includes(a.status)).length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const avgGrade = submissions.filter((s) => s.grade !== null).reduce((sum, s) => sum + s.grade, 0) / (submissions.filter((s) => s.grade !== null).length || 1);

    const summaryJson = {
      attendanceDays: attendance.length,
      presentDays,
      standupCount: standups.length,
      totalTasks: tasks.length,
      completedTasks,
      submissionCount: submissions.length,
      avgGrade: Math.round(avgGrade * 10) / 10,
      quizAttempts: quizAttempts.length,
      commitCount: commits.length,
      totalAdditions: commits.reduce((s, c) => s + c.additions, 0),
      totalDeletions: commits.reduce((s, c) => s + c.deletions, 0),
    };

    const report = await prisma.weeklyReport.upsert({
      where: { internId_weekNumber: { internId: targetId, weekNumber: weekNumber || 1 } },
      update: { summaryJson, mentorId: req.user.role !== 'INTERN' ? req.user.id : undefined },
      create: { internId: targetId, weekNumber: weekNumber || 1, summaryJson, mentorId: req.user.role !== 'INTERN' ? req.user.id : null },
      include: { intern: { select: { id: true, name: true, email: true } }, mentor: { select: { id: true, name: true } } },
    });

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function getWeeklyReports(req, res) {
  try {
    const where = {};
    if (req.query.internId) where.internId = req.query.internId;
    if (req.query.weekNumber) where.weekNumber = parseInt(req.query.weekNumber);
    if (req.user.role === 'INTERN') where.internId = req.user.id;

    const reports = await prisma.weeklyReport.findMany({
      where,
      include: {
        intern: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true } },
      },
      orderBy: { weekNumber: 'desc' },
    });
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function addMentorComment(req, res) {
  try {
    const { id } = req.params;
    const { mentorComments, overallScore } = req.body;
    const report = await prisma.weeklyReport.update({
      where: { id },
      data: { mentorComments, overallScore: overallScore ? parseFloat(overallScore) : undefined, mentorId: req.user.id },
      include: { intern: { select: { id: true, name: true } } },
    });
    await prisma.notification.create({
      data: { userId: report.internId, type: 'WEEKLY_REPORT', title: 'Weekly Report Reviewed', message: `Your week ${report.weekNumber} report has mentor feedback`, link: '/progress' },
    });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// ─── Mentor Evaluations ─────────────────────────────

async function createEvaluation(req, res) {
  try {
    const { internId, weekNumber, technicalScore, softSkillScore, attendanceScore, feedback, areasOfImprovement } = req.body;
    const overallScore = Math.round(((technicalScore + softSkillScore + attendanceScore) / 3) * 10) / 10;

    const evaluation = await prisma.mentorEvaluation.upsert({
      where: { internId_mentorId_weekNumber: { internId, mentorId: req.user.id, weekNumber } },
      update: { technicalScore, softSkillScore, attendanceScore, overallScore, feedback, areasOfImprovement },
      create: { internId, mentorId: req.user.id, weekNumber, technicalScore, softSkillScore, attendanceScore, overallScore, feedback: feedback || null, areasOfImprovement: areasOfImprovement || null },
      include: { intern: { select: { id: true, name: true } }, mentor: { select: { id: true, name: true } } },
    });

    await prisma.notification.create({
      data: { userId: internId, type: 'EVALUATION', title: 'New Evaluation', message: `${req.user.name} evaluated your week ${weekNumber} performance`, link: '/progress' },
    });

    res.json({ success: true, data: evaluation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function getEvaluations(req, res) {
  try {
    const where = {};
    if (req.query.internId) where.internId = req.query.internId;
    if (req.query.mentorId) where.mentorId = req.query.mentorId;
    if (req.query.weekNumber) where.weekNumber = parseInt(req.query.weekNumber);
    if (req.user.role === 'INTERN') where.internId = req.user.id;

    const evaluations = await prisma.mentorEvaluation.findMany({
      where,
      include: {
        intern: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true } },
      },
      orderBy: { weekNumber: 'desc' },
    });
    res.json({ success: true, data: evaluations });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// ─── Progress Dashboard ─────────────────────────────

async function getInternProgress(req, res) {
  try {
    const internId = req.params.internId || req.user.id;

    const [attendance, tasks, submissions, quizAttempts, commits, peerReviews, evaluations, weeklyReports, capstone] = await Promise.all([
      prisma.attendance.findMany({ where: { internId }, orderBy: { date: 'desc' }, take: 100 }),
      prisma.dailyTask.findMany({ where: { internId }, orderBy: { date: 'desc' }, take: 100 }),
      prisma.submission.findMany({ where: { internId }, include: { assignment: { select: { title: true, maxScore: true } } }, orderBy: { submittedAt: 'desc' } }),
      prisma.quizAttempt.findMany({ where: { internId }, include: { quiz: { select: { title: true, maxScore: true } } }, orderBy: { startedAt: 'desc' } }),
      prisma.commitLog.count({ where: { internId } }),
      prisma.peerReview.findMany({ where: { revieweeId: internId }, include: { reviewer: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.mentorEvaluation.findMany({ where: { internId }, include: { mentor: { select: { name: true } } }, orderBy: { weekNumber: 'desc' } }),
      prisma.weeklyReport.findMany({ where: { internId }, orderBy: { weekNumber: 'desc' } }),
      prisma.capstoneProject.findFirst({ where: { internId } }),
    ]);

    const presentDays = attendance.filter((a) => ['PRESENT', 'LATE'].includes(a.status)).length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const gradedSubmissions = submissions.filter((s) => s.grade !== null);
    const avgGrade = gradedSubmissions.length ? gradedSubmissions.reduce((s, sub) => s + sub.grade, 0) / gradedSubmissions.length : 0;
    const bestQuizScores = {};
    quizAttempts.forEach((a) => {
      if (!bestQuizScores[a.quizId] || (a.score || 0) > bestQuizScores[a.quizId]) {
        bestQuizScores[a.quizId] = a.score || 0;
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          attendanceRate: attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0,
          totalDays: attendance.length,
          presentDays,
          taskCompletionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
          totalTasks: tasks.length,
          completedTasks,
          avgGrade: Math.round(avgGrade * 10) / 10,
          totalSubmissions: submissions.length,
          gradedSubmissions: gradedSubmissions.length,
          quizzesTaken: Object.keys(bestQuizScores).length,
          commitCount: commits,
          capstonePhase: capstone?.phase || null,
        },
        recentEvaluations: evaluations.slice(0, 5),
        recentPeerReviews: peerReviews,
        weeklyReports: weeklyReports.slice(0, 10),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  createPeerReview,
  getPeerReviews,
  generateWeeklyReport,
  getWeeklyReports,
  addMentorComment,
  createEvaluation,
  getEvaluations,
  getInternProgress,
};
