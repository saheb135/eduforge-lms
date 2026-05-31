import express from 'express';
import {
  getAttendance,
  joinLiveSession,
  markMaterialComplete,
  getMyAllAttendance,
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my', authenticate, authorize('STUDENT'), getMyAllAttendance);
router.get('/course/:courseId', authenticate, authorize('STUDENT'), getAttendance);
router.post('/join-session', authenticate, authorize('STUDENT'), joinLiveSession);
router.post('/complete-material', authenticate, authorize('STUDENT'), markMaterialComplete);

export default router;
