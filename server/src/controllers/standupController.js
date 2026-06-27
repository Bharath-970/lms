const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function submitStandup(req, res) {
  try {
    const internId = req.user.id;
    const { yesterday, today, blockers } = req.validated;
    const now = new Date();
    const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const standup = await prisma.dailyStandup.upsert({
      where: { internId_date: { internId, date: todayDate } },
      update: { yesterday, today, blockers },
      create: { internId, date: todayDate, yesterday, today, blockers },
    });

    return success(res, standup, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getMyStandups(req, res) {
  try {
    const standups = await prisma.dailyStandup.findMany({
      where: { internId: req.user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return success(res, standups);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getTodayStandups(req, res) {
  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const standups = await prisma.dailyStandup.findMany({
      where: { date: today },
      include: {
        intern: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, standups);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getStandupsByIntern(req, res) {
  try {
    const { internId } = req.params;
    const standups = await prisma.dailyStandup.findMany({
      where: { internId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return success(res, standups);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = { submitStandup, getMyStandups, getTodayStandups, getStandupsByIntern };
