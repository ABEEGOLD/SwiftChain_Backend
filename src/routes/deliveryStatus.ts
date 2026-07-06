import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth';
import { HttpError } from '../utils/httpError';

const router = Router();

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['assigned'],
  assigned: ['picked_up'],
  picked_up: ['in_transit'],
  in_transit: ['delivered'],
  delivered: [],
};

router.put('/:id/status', authenticate, authorize(['driver', 'admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new HttpError(400, 'Invalid delivery ID'));
      return;
    }

    const DeliveryModel = mongoose.models['Delivery'];
    if (!DeliveryModel) {
      next(new HttpError(500, 'Delivery model not found'));
      return;
    }

    const delivery = await DeliveryModel.findById(id);
    if (!delivery) {
      next(new HttpError(404, 'Delivery not found'));
      return;
    }

    const allowed = VALID_TRANSITIONS[delivery.status] ?? [];
    if (!allowed.includes(status)) {
      next(new HttpError(400, `Invalid status transition from '${delivery.status}' to '${status}'`));
      return;
    }

    delivery.status = status;
    await delivery.save();
    res.status(200).json({ status: 'success', data: delivery });
  } catch (error) {
    next(error);
  }
});

export default router;
