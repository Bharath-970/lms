const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

function getToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getTimeWindow(now) {
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;

  if (mins >= 570 && mins <= 630) return 'PRESENT';   // 9:30 - 10:30
  if (mins > 630 && mins <= 660) return 'LATE';        // 10:30 - 11:00
  return null;                                          // after 11:00
}

async function markAttendance(req, res) {
  try {
    const internId = req.user.id;
    const now = new Date();
    const today = getToday();

    const window = getTimeWindow(now);
    if (!window) {
      return error(res, 'Attendance window closed. Contact mentor for override.', 400);
    }

    const existing = await prisma.attendance.findUnique({
      where: { internId_date: { internId, date: today } },
    });

    if (existing && existing.status !== 'ABSENT') {
      return error(res, 'Attendance already marked for today', 400);
    }

    const totalTasks = await prisma.dailyTask.count({
      where: { internId, date: today },
    });

    const record = await prisma.attendance.upsert({
      where: { internId_date: { internId, date: today } },
      update: {
        markedAt: now,
        status: window,
        tasksTotalCount: totalTasks,
      },
      create: {
        internId,
        date: today,
        markedAt: now,
        status: window,
        tasksTotalCount: totalTasks,
      },
    });

    return success(res, record, 200);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getMyAttendance(req, res) {
  try {
    const internId = req.user.id;
    const { month, year } = req.query;

    const where = { internId };
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0);
      where.date = { gte: start, lte: end };
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return success(res, records);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getTodayAttendance(req, res) {
  try {
    const today = getToday();

    const records = await prisma.attendance.findMany({
      where: { date: today },
      include: {
        intern: { select: { id: true, name: true, email: true } },
      },
      orderBy: { intern: { name: 'asc' } },
    });

    return success(res, records);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getAllAttendance(req, res) {
  try {
    const { date, internId } = req.query;
    const where = {};
    if (date) where.date = new Date(date);
    if (internId) where.internId = internId;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        intern: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });

    return success(res, records);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function overrideAttendance(req, res) {
  try {
    const { internId, date, status, reason } = req.validated;
    const dateObj = new Date(date);

    const record = await prisma.attendance.upsert({
      where: { internId_date: { internId, date: dateObj } },
      update: {
        status,
        overrideBy: req.user.id,
        overrideReason: reason,
      },
      create: {
        internId,
        date: dateObj,
        status,
        overrideBy: req.user.id,
        overrideReason: reason,
      },
    });

    await prisma.notification.create({
      data: {
        userId: internId,
        type: 'ATTENDANCE_OVERRIDE',
        title: 'Attendance Updated',
        message: `Your attendance for ${date} was updated to ${status} by mentor.`,
        link: '/attendance',
      },
    });

    return success(res, record);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = { markAttendance, getMyAttendance, getTodayAttendance, getAllAttendance, overrideAttendance };
