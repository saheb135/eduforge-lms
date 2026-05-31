import { prisma } from '../config/prisma.js';

export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, materials: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        materials: { orderBy: { uploadedAt: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if requesting student is enrolled
    let isEnrolled = false;
    let enrollment = null;
    if (req.user && req.user.role === 'STUDENT') {
      enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: req.user.id, courseId: id } },
      });
      isEnrolled = enrollment?.paymentStatus === 'ACTIVE';
    }

    // Teachers/Admins always see materials
    const canViewMaterials = isEnrolled || ['TEACHER', 'ADMIN'].includes(req.user?.role);

    res.json({
      success: true,
      data: {
        ...course,
        materials: canViewMaterials ? course.materials : [],
        isEnrolled,
        enrollment,
      },
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, description, subject, monthlyPrice, thumbnailUrl } = req.body;

    if (!title || !description || !subject || !monthlyPrice) {
      return res.status(400).json({ success: false, message: 'Title, description, subject, and price are required' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        subject,
        monthlyPrice: parseFloat(monthlyPrice),
        thumbnailUrl: thumbnailUrl || null,
        instructorId: req.user.id,
      },
      include: {
        instructor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, monthlyPrice, thumbnailUrl } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(subject && { subject }),
        ...(monthlyPrice && { monthlyPrice: parseFloat(monthlyPrice) }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
    });

    res.json({ success: true, message: 'Course updated', data: updated });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.course.delete({ where: { id } });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      include: {
        _count: { select: { enrollments: true, materials: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
