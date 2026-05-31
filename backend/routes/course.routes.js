import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} from '../controllers/course.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/my-courses', authenticate, authorize('TEACHER', 'ADMIN'), getMyCourses);
router.get('/:id', authenticate, getCourseById);
router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), createCourse);
router.put('/:id', authenticate, authorize('TEACHER', 'ADMIN'), updateCourse);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), deleteCourse);

export default router;
