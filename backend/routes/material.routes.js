import express from 'express';
import { getMaterialsByCourse, addMaterial, deleteMaterial } from '../controllers/material.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/course/:courseId', authenticate, getMaterialsByCourse);
router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), addMaterial);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), deleteMaterial);

export default router;
