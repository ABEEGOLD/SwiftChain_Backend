import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status-codes';
import {
  deliveryService,
  CreateDeliveryInput,
  UpdateDeliveryInput,
  DeliveryFilter,
  DeliveryStatus,
} from '../services/delivery.service';

export class DeliveryController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateDeliveryInput = {
        trackingNumber: req.body.trackingNumber,
        deliveryId: req.body.deliveryId,
        driverId: req.body.driverId,
        userId: req.body.userId,
        customer: req.body.customer,
        pickup: req.body.pickup,
        dropoff: req.body.dropoff,
        package: req.body.package,
        pickupCoordinates: req.body.pickupCoordinates,
        dropoffCoordinates: req.body.dropoffCoordinates,
        deliveryFee: req.body.deliveryFee,
        escrowAmount: req.body.escrowAmount,
        notes: req.body.notes,
        distance: req.body.distance,
        estimatedDuration: req.body.estimatedDuration,
      };
      const delivery = await deliveryService.create(input);
      res.status(httpStatus.CREATED).json({ status: 'success', data: delivery });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await deliveryService.getById(req.params.id);
      res.status(httpStatus.OK).json({ status: 'success', data: delivery, message: delivery.isDeleted ? 'Delivery archived successfully' : 'Delivery restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const VALID_STATUSES: DeliveryStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
      const statusParam = req.query.status as string | undefined;
      const validatedStatus = VALID_STATUSES.includes(statusParam as DeliveryStatus)
        ? (statusParam as DeliveryStatus)
        : undefined;
      const filters: DeliveryFilter = {
        status: validatedStatus,
        driver: req.query.driver as string | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      };
      const result = await deliveryService.list(filters);
      res.status(httpStatus.OK).json({
        status: 'success',
        data: result.data,
        meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: UpdateDeliveryInput = {
        status: req.body.status,
        driverId: req.body.driverId,
        estimatedDuration: req.body.estimatedDuration,
        actualDuration: req.body.actualDuration,
        notes: req.body.notes,
      };
      const delivery = await deliveryService.update(req.params.id, input);
      res.status(httpStatus.OK).json({ status: 'success', data: delivery, message: delivery.isDeleted ? 'Delivery archived successfully' : 'Delivery restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await deliveryService.archive(req.params.id, req.user?.id);
      res.status(httpStatus.OK).json({ status: 'success', data: delivery, message: delivery.isDeleted ? 'Delivery archived successfully' : 'Delivery restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await deliveryService.restore(req.params.id);
      res.status(httpStatus.OK).json({ status: 'success', data: delivery, message: delivery.isDeleted ? 'Delivery archived successfully' : 'Delivery restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async listArchived(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await deliveryService.listArchived(page, limit);
      res.status(httpStatus.OK).json({ status: 'success', data: result.data, meta: result });
    } catch (error) {
      next(error);
    }
  }
}

export const deliveryController = new DeliveryController();
