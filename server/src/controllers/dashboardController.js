const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAdminDashboard(req, res) {
  try {
    const [
      userCounts,
      batchCount,
      courseCount,
      assignmentCount,
      quizCount,
      hackathonCount,
      recentUsers,
      todayAttendance,
      pendingSubmissions,
      recentNotifications,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.batch.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count(),
      prisma.assignment.count(),
      prisma.quiz.count(),
      prisma.hackathon.count(),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } }),
      prisma.attendance.findMany({
        where: { date: new Date(new Date().toISOString().split('T')[0]) },
        select: { status: true },
      }),
      prisma.submission.count({ where: { status: 'SUBMITTED' } }),
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const roleCounts = Object.fromEntries(userCounts.map((r) => [r.role, r._count]));
    const presentToday = todayAttendance.filter((a) => ['PRESENT', 'LATE'].includes(a.status)).length;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: Object.values(roleCounts).reduce((a, b) => a + b, 0),
          admins: roleCounts.ADMIN || 0,
          mentors: roleCounts.MENTOR || 0,
          interns: roleCounts.INTERN || 0,
          activeBatches: batchCount,
          courses: courseCount,
          assignments: assignmentCount,
          quizzes: quizCount,
          hackathons: hackathonCount,
          presentToday,
          totalToday: todayAttendance.length,
          pendingSubmissions,
        },
        recentUsers,
        notifications: recentNotifications,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function getMentorDashboard(req, res) {
  try {
    const mentorId = req.user.id;
    const menteeRelations = await prisma.mentorIntern.findMany({
      where: { mentorId },
      select: { internId: true },
    });
    const menteeIds = menteeRelations.map((m) => m.internId);

    const [
      menteeCount,
      todayAttendance,
      pendingSubmissions,
      pendingReviews,
      recentStandups,
      recentNotifications,
    ] = await Promise.all([
      menteeIds.length,
      prisma.attendance.findMany({
        where: { internId: { in: menteeIds }, date: new Date(new Date().toISOString().split('T')[0]) },
        include: { intern: { select: { id: true, name: true } } },
      }),
      prisma.submission.count({ where: { internId: { in: menteeIds }, status: 'SUBMITTED' } }),
      prisma.codeReview.count({ where: { reviewerId: mentorId, status: 'PENDING' } }),
      prisma.dailyStandup.findMany({
        where: { internId: { in: menteeIds }, date: new Date(new Date().toISOString().split('T')[0]) },
        include: { intern: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.findMany({
        where: { userId: mentorId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const presentToday = todayAttendance.filter((a) => ['PRESENT', 'LATE'].includes(a.status)).length;

    res.json({
      success: true,
      data: {
        stats: {
          menteeCount,
          presentToday,
          totalToday: todayAttendance.length,
          pendingSubmissions,
          pendingReviews,
          standupsDone: recentStandups.length,
        },
        todayAttendance,
        recentStandups,
        notifications: recentNotifications,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function getInternDashboard(req, res) {
  try {
    const internId = req.user.id;
    const today = new Date(new Date().toISOString().split('T')[0]);

    const [
      attendance,
      todayAttendance,
      todayTasks,
      submissions,
      quizAttempts,
      commits,
      xpTotal,
      badges,
      streaks,
      capstone,
      notifications,
    ] = await Promise.all([
      prisma.attendance.findMany({ where: { internId }, orderBy: { date: 'desc' }, take: 30 }),
      prisma.attendance.findFirst({ where: { internId, date: today } }),
      prisma.dailyTask.findMany({ where: { internId, date: today } }),
      prisma.submission.findMany({ where: { internId }, orderBy: { submittedAt: 'desc' }, take: 5, include: { assignment: { select: { title: true, maxScore: true } } } }),
      prisma.quizAttempt.count({ where: { internId } }),
      prisma.commitLog.count({ where: { internId } }),
      prisma.xpLog.aggregate({ where: { internId }, _sum: { amount: true } }),
      prisma.earnedBadge.count({ where: { internId } }),
      prisma.streak.findMany({ where: { internId } }),
      prisma.capstoneProject.findFirst({ where: { internId } }),
      prisma.notification.findMany({ where: { userId: internId, read: false }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const presentDays = attendance.filter((a) => ['PRESENT', 'LATE'].includes(a.status)).length;
    const completedTasks = todayTasks.filter((t) => t.status === 'COMPLETED').length;
    const attendanceStreak = streaks.find((s) => s.type === 'attendance');

    res.json({
      success: true,
      data: {
        stats: {
          attendanceRate: attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0,
          markedToday: !!todayAttendance,
          todayStatus: todayAttendance?.status || null,
          todayTasks: todayTasks.length,
          completedTasks,
          totalSubmissions: submissions.length,
          quizAttempts,
          commits,
          totalXp: xpTotal._sum.amount || 0,
          badgeCount: badges,
          currentStreak: attendanceStreak?.currentCount || 0,
          longestStreak: attendanceStreak?.longestCount || 0,
          capstonePhase: capstone?.phase || null,
        },
        recentSubmissions: submissions,
        notifications,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function getNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, read: false } });
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function markNotificationsRead(req, res) {
  try {
    const { ids } = req.body;
    if (ids && ids.length) {
      await prisma.notification.updateMany({ where: { id: { in: ids }, userId: req.user.id }, data: { read: true } });
    } else {
      await prisma.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } });
    }
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getAdminDashboard,
  getMentorDashboard,
  getInternDashboard,
  getNotifications,
  markNotificationsRead,
};
