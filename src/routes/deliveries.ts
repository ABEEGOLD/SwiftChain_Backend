import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import authenticate from '../middleware/authenticate';
import { authorize } from '../middleware/auth';

const router = Router();

router.put('/:id/status', authenticate, authorize(['driver', 'admin']), (req, res, next) => deliveryController.update(req, res, next));

export default router;
