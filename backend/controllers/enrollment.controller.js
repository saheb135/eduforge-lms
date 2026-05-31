import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/prisma.js';

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.id },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true } },
            _count: { select: { materials: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mock payment processor - simulates Razorpay/Stripe
export const processPayment = async (req, res) => {
  try {
    const { courseId, cardNumber, expiryDate, cvv, cardholderName } = req.body;

    // Validate required payment fields
    if (!courseId || !cardNumber || !expiryDate || !cvv || !cardholderName) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' });
    }

    // Simulate card validation
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({ success: false, message: 'Invalid CVV' });
    }

    // Test card to always fail (simulate)
    if (cleanCard === '4000000000000002') {
      return res.status(402).json({ success: false, message: 'Payment declined by bank' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const now = new Date();
    const nextPaymentDue = new Date(now);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);

    const transactionId = `TXN-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

    // Upsert enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
      update: {
        paymentStatus: 'ACTIVE',
        lastPaymentDate: now,
        nextPaymentDue,
        amountPaid: course.monthlyPrice,
        transactionId,
      },
      create: {
        studentId: req.user.id,
        courseId,
        paymentStatus: 'ACTIVE',
        lastPaymentDate: now,
        nextPaymentDue,
        amountPaid: course.monthlyPrice,
        transactionId,
      },
    });

    // Initialize attendance record
    await prisma.attendance.upsert({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
      update: {},
      create: {
        studentId: req.user.id,
        courseId,
        lecturesAttended: 0,
        totalLectures: await prisma.material.count({ where: { courseId } }),
        progressPercentage: 0,
      },
    });

    // Award XP for enrollment
    await prisma.user.update({
      where: { id: req.user.id },
      data: { xpPoints: { increment: 50 } },
    });

    res.json({
      success: true,
      message: 'Payment successful! You are now enrolled.',
      data: {
        enrollment,
        transactionId,
        amountPaid: course.monthlyPrice,
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed' });
  }
};

export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });

    res.json({
      success: true,
      data: {
        isEnrolled: enrollment?.paymentStatus === 'ACTIVE',
        enrollment: enrollment || null,
      },
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
