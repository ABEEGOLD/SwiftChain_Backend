import { Router } from 'express';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import deliveriesRoutes from './deliveries';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Delivery routes
router.use('/deliveries', deliveriesRoutes);

export default router;
