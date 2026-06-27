const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function createAssignment(req, res) {
  try {
    const {
      moduleId, title, description, rubricJson, maxScore,
      deadline, fileTypes, maxFileSize, allowResubmit,
      maxResubmits, isMiniProject,
    } = req.validated;

    const assignment = await prisma.assignment.create({
      data: {
        moduleId: moduleId || null,
        title,
        description,
        rubricJson: rubricJson || null,
        maxScore,
        deadline: new Date(deadline),
        fileTypes: fileTypes || null,
        maxFileSize: maxFileSize || 52428800,
        allowResubmit: allowResubmit || false,
        maxResubmits: maxResubmits || 1,
        isMiniProject: isMiniProject || false,
        createdBy: req.user.id,
      },
    });

    return success(res, assignment, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function listAssignments(req, res) {
  try {
    const { moduleId } = req.query;
    const where = {};
    if (moduleId) where.moduleId = moduleId;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        module: { select: { id: true, title: true, course: { select: { title: true, weekNumber: true } } } },
        _count: { select: { submissions: true } },
      },
      orderBy: { deadline: 'asc' },
    });

    return success(res, assignments);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getAssignment(req, res) {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, title: true, course: { select: { title: true, weekNumber: true } } } },
        submissions: {
          include: {
            intern: { select: { id: true, name: true, email: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!assignment) return error(res, 'Assignment not found', 404);

    if (req.user.role === 'INTERN') {
      assignment.submissions = assignment.submissions.filter(
        (s) => s.internId === req.user.id
      );
    }

    return success(res, assignment);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const data = {};
    const fields = ['title', 'description', 'rubricJson', 'maxScore', 'fileTypes', 'maxFileSize', 'allowResubmit', 'maxResubmits', 'isMiniProject'];
    fields.forEach((f) => {
      if (req.validated[f] !== undefined) data[f] = req.validated[f];
    });
    if (req.validated.deadline) data.deadline = new Date(req.validated.deadline);

    const assignment = await prisma.assignment.update({
      where: { id },
      data,
    });
    return success(res, assignment);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;
    await prisma.assignment.delete({ where: { id } });
    return success(res, { message: 'Assignment deleted' });
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function submitAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const internId = req.user.id;

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return error(res, 'Assignment not found', 404);

    const existing = await prisma.submission.findMany({
      where: { assignmentId, internId },
      orderBy: { submittedAt: 'desc' },
    });

    if (existing.length > 0) {
      const latest = existing[0];
      if (latest.status === 'SUBMITTED') {
        return error(res, 'Previous submission pending review', 400);
      }
      if (!assignment.allowResubmit) {
        return error(res, 'Resubmission not allowed', 400);
      }
      if (latest.resubmitCount >= assignment.maxResubmits) {
        return error(res, `Max resubmissions (${assignment.maxResubmits}) reached`, 400);
      }
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const content = req.body.content || null;

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        internId,
        fileUrl,
        content,
        resubmitCount: existing.length > 0 ? existing[0].resubmitCount + 1 : 0,
      },
    });

    await prisma.notification.create({
      data: {
        userId: assignment.createdBy,
        type: 'SUBMISSION_RECEIVED',
        title: 'New Submission',
        message: `${req.user.name} submitted ${assignment.title}`,
        link: `/assignments/${assignmentId}`,
      },
    });

    return success(res, submission, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function gradeSubmission(req, res) {
  try {
    const { id } = req.params;
    const { grade, feedback, requestResubmit } = req.validated;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: true },
    });
    if (!submission) return error(res, 'Submission not found', 404);

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        grade: requestResubmit ? null : grade,
        feedback,
        status: requestResubmit ? 'RESUBMIT_REQUESTED' : 'GRADED',
        gradedBy: req.user.id,
        gradedAt: new Date(),
      },
    });

    const notifMessage = requestResubmit
      ? `Resubmission requested for ${submission.assignment.title}: ${feedback}`
      : `Your ${submission.assignment.title} was graded: ${grade}/${submission.assignment.maxScore}`;

    await prisma.notification.create({
      data: {
        userId: submission.internId,
        type: requestResubmit ? 'RESUBMIT_REQUESTED' : 'SUBMISSION_GRADED',
        title: requestResubmit ? 'Resubmission Requested' : 'Assignment Graded',
        message: notifMessage,
        link: `/assignments/${submission.assignmentId}`,
      },
    });

    return success(res, updated);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = {
  createAssignment, listAssignments, getAssignment,
  updateAssignment, deleteAssignment, submitAssignment, gradeSubmission,
};
