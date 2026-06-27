const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function createTask(req, res) {
  try {
    const { internId, title, description, dueTime } = req.validated;
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const task = await prisma.dailyTask.create({
      data: {
        internId,
        date: today,
        title,
        description,
        assignedBy: req.user.id,
        dueTime: dueTime ? new Date(dueTime) : null,
      },
    });

    const totalTasks = await prisma.dailyTask.count({
      where: { internId, date: today },
    });
    await prisma.attendance.updateMany({
      where: { internId, date: today },
      data: { tasksTotalCount: totalTasks },
    });

    await prisma.notification.create({
      data: {
        userId: internId,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `New task: ${title}`,
        link: '/tasks',
      },
    });

    return success(res, task, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getMyTasks(req, res) {
  try {
    const { date } = req.query;
    const now = new Date();
    const dateObj = date
      ? new Date(date + 'T00:00:00.000Z')
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const tasks = await prisma.dailyTask.findMany({
      where: { internId: req.user.id, date: dateObj },
      include: {
        assigner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return success(res, tasks);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getTasksByIntern(req, res) {
  try {
    const { internId } = req.params;
    const { date } = req.query;
    const now = new Date();
    const dateObj = date
      ? new Date(date + 'T00:00:00.000Z')
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const tasks = await prisma.dailyTask.findMany({
      where: { internId, date: dateObj },
      include: {
        assigner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return success(res, tasks);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.validated;

    const task = await prisma.dailyTask.findUnique({ where: { id } });
    if (!task) return error(res, 'Task not found', 404);

    if (req.user.role === 'INTERN' && task.internId !== req.user.id) {
      return error(res, 'Not authorized', 403);
    }

    const updated = await prisma.dailyTask.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    if (status === 'COMPLETED') {
      const completedCount = await prisma.dailyTask.count({
        where: { internId: task.internId, date: task.date, status: 'COMPLETED' },
      });
      await prisma.attendance.updateMany({
        where: { internId: task.internId, date: task.date },
        data: { tasksCompletedCount: completedCount },
      });
    }

    return success(res, updated);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await prisma.dailyTask.findUnique({ where: { id } });
    if (!task) return error(res, 'Task not found', 404);

    await prisma.dailyTask.delete({ where: { id } });

    const totalTasks = await prisma.dailyTask.count({
      where: { internId: task.internId, date: task.date },
    });
    await prisma.attendance.updateMany({
      where: { internId: task.internId, date: task.date },
      data: { tasksTotalCount: totalTasks },
    });

    return success(res, { message: 'Task deleted' });
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = { createTask, getMyTasks, getTasksByIntern, updateTaskStatus, deleteTask };
