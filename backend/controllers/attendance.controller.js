import { prisma } from '../config/prisma.js';

export const getAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
      include: {
        course: { select: { title: true } },
      },
    });

    res.json({ success: true, data: attendance || null });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const joinLiveSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    // Verify active enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });

    if (!enrollment || enrollment.paymentStatus !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Must be enrolled to join live sessions' });
    }

    const totalMaterials = await prisma.material.count({ where: { courseId } });

    let attendance = await prisma.attendance.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });

    if (!attendance) {
      attendance = await prisma.attendance.create({
        data: {
          studentId: req.user.id,
          courseId,
          lecturesAttended: 1,
          totalLectures: totalMaterials || 1,
          progressPercentage: totalMaterials > 0 ? (1 / totalMaterials) * 100 : 10,
          lastAccessed: new Date(),
        },
      });
    } else {
      const newAttended = Math.min(attendance.lecturesAttended + 1, totalMaterials || attendance.totalLectures);
      const newTotal = Math.max(totalMaterials, attendance.totalLectures);
      const newProgress = newTotal > 0 ? (newAttended / newTotal) * 100 : 0;

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          lecturesAttended: newAttended,
          totalLectures: newTotal,
          progressPercentage: Math.min(newProgress, 100),
          lastAccessed: new Date(),
        },
      });
    }

    // Award XP for attending live session
    await prisma.user.update({
      where: { id: req.user.id },
      data: { xpPoints: { increment: 20 } },
    });

    res.json({
      success: true,
      message: 'Joined live session! Attendance recorded.',
      data: attendance,
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markMaterialComplete = async (req, res) => {
  try {
    const { courseId, materialId } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });

    if (!enrollment || enrollment.paymentStatus !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Not enrolled' });
    }

    const totalMaterials = await prisma.material.count({ where: { courseId } });

    let attendance = await prisma.attendance.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });

    if (!attendance) {
      attendance = await prisma.attendance.create({
        data: {
          studentId: req.user.id,
          courseId,
          lecturesAttended: 1,
          totalLectures: totalMaterials,
          progressPercentage: totalMaterials > 0 ? (1 / totalMaterials) * 100 : 0,
          lastAccessed: new Date(),
        },
      });
    } else {
      const newAttended = Math.min(attendance.lecturesAttended + 1, totalMaterials);
      const newProgress = totalMaterials > 0 ? (newAttended / totalMaterials) * 100 : 0;

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          lecturesAttended: newAttended,
          totalLectures: totalMaterials,
          progressPercentage: Math.min(newProgress, 100),
          lastAccessed: new Date(),
        },
      });
    }

    // Award XP for completing material
    await prisma.user.update({
      where: { id: req.user.id },
      data: { xpPoints: { increment: 10 } },
    });

    res.json({ success: true, message: 'Progress updated! +10 XP', data: attendance });
  } catch (error) {
    console.error('Mark material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyAllAttendance = async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId: req.user.id },
      include: {
        course: { select: { id: true, title: true, subject: true } },
      },
    });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
