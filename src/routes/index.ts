import { Router } from 'express';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import deliveriesRoutes from './deliveries';
import deliveryStatusRoutes from './deliveryStatus';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/deliveries', deliveriesRoutes);
router.use('/deliveries', deliveryStatusRoutes);

export default router;
