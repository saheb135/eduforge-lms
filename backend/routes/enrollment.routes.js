// enrollment.routes.js
import express from 'express';
import { getMyEnrollments, processPayment, checkEnrollment } from '../controllers/enrollment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('STUDENT'), getMyEnrollments);
router.post('/pay', authenticate, authorize('STUDENT'), processPayment);
router.get('/check/:courseId', authenticate, checkEnrollment);

export default router;
