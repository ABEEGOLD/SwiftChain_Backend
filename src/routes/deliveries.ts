import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', (req, res, next) => deliveryController.create(req, res, next));
router.get('/', (req, res, next) => deliveryController.list(req, res, next));
router.get('/archived', (req, res, next) => deliveryController.listArchived(req, res, next));
router.get('/:id', (req, res, next) => deliveryController.getById(req, res, next));
router.patch('/:id', (req, res, next) => deliveryController.update(req, res, next));
router.patch('/:id/archive', (req, res, next) => deliveryController.archive(req, res, next));
router.patch('/:id/restore', (req, res, next) => deliveryController.restore(req, res, next));

export default router;
