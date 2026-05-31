import express from 'express';
import {
  getDashboardStats,
  getAllStudents,
  getAllEnrollments,
  getTeacherStats,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/students', authenticate, authorize('ADMIN', 'TEACHER'), getAllStudents);
router.get('/enrollments', authenticate, authorize('ADMIN'), getAllEnrollments);
router.get('/teacher-stats', authenticate, authorize('TEACHER', 'ADMIN'), getTeacherStats);

export default router;
