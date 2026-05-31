import { prisma } from '../config/prisma.js';

export const getMaterialsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Students must be enrolled
    if (req.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: req.user.id, courseId } },
      });
      if (!enrollment || enrollment.paymentStatus !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: 'Enroll in this course to access materials' });
      }
    }

    const materials = await prisma.material.findMany({
      where: { courseId },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { uploadedAt: 'asc' },
    });

    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addMaterial = async (req, res) => {
  try {
    const { courseId, title, type, sourceUrl, duration } = req.body;

    if (!courseId || !title || !type || !sourceUrl) {
      return res.status(400).json({ success: false, message: 'courseId, title, type, and sourceUrl are required' });
    }

    const validTypes = ['VIDEO', 'PDF', 'DOCUMENT'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Type must be VIDEO, PDF, or DOCUMENT' });
    }

    // Verify course exists and teacher owns it (unless admin)
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'TEACHER' && course.instructorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only add materials to your own courses' });
    }

    const material = await prisma.material.create({
      data: {
        courseId,
        title,
        type: type.toUpperCase(),
        sourceUrl,
        duration: duration ? parseInt(duration) : null,
        uploaderId: req.user.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    // Update total lectures in all attendance records for this course
    await prisma.attendance.updateMany({
      where: { courseId },
      data: {
        totalLectures: await prisma.material.count({ where: { courseId } }),
      },
    });

    // Recalculate progress percentages
    const attendances = await prisma.attendance.findMany({ where: { courseId } });
    const totalMaterials = await prisma.material.count({ where: { courseId } });

    for (const att of attendances) {
      const progress = totalMaterials > 0 ? (att.lecturesAttended / totalMaterials) * 100 : 0;
      await prisma.attendance.update({
        where: { id: att.id },
        data: { progressPercentage: Math.min(progress, 100), totalLectures: totalMaterials },
      });
    }

    res.status(201).json({ success: true, message: 'Material added successfully', data: material });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (req.user.role === 'TEACHER' && material.course.instructorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.material.delete({ where: { id } });
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
