import { prisma } from '../config/prisma.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalCourses, totalEnrollments, revenueData, recentEnrollments] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.enrollment.count({ where: { paymentStatus: 'ACTIVE' } }),
      prisma.enrollment.aggregate({
        where: { paymentStatus: 'ACTIVE' },
        _sum: { amountPaid: true },
      }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
    ]);

    // Course-wise enrollment breakdown
    const courseStats = await prisma.course.findMany({
      include: {
        _count: { select: { enrollments: true } },
        instructor: { select: { name: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        activeEnrollments: totalEnrollments,
        totalRevenue: revenueData._sum.amountPaid || 0,
        recentEnrollments,
        courseStats,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        xpPoints: true,
        streak: true,
        createdAt: true,
        enrollments: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
        attendance: {
          include: {
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, monthlyPrice: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const courses = await prisma.course.findMany({
      where: { instructorId: teacherId },
      include: {
        _count: { select: { enrollments: true, materials: true } },
        enrollments: {
          where: { paymentStatus: 'ACTIVE' },
          include: {
            student: { select: { id: true, name: true, email: true, xpPoints: true } },
          },
        },
      },
    });

    const totalStudents = courses.reduce((sum, c) => sum + c.enrollments.length, 0);
    const totalRevenue = courses.reduce(
      (sum, c) => sum + c.enrollments.length * c.monthlyPrice,
      0
    );

    // Get progress data for teacher's courses
    const progressData = await prisma.attendance.findMany({
      where: {
        course: { instructorId: teacherId },
      },
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });

    res.json({
      success: true,
      data: {
        courses,
        totalStudents,
        totalRevenue,
        progressData,
      },
    });
  } catch (error) {
    console.error('Teacher stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
