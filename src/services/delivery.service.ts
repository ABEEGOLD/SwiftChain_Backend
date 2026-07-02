import { Types } from 'mongoose';
import httpStatus from 'http-status-codes';
import Delivery, { IDelivery } from '../models/Delivery';
import { AppError } from '../utils/AppError';
import logger from '../config/logger';

export type DeliveryStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateDeliveryInput {
  deliveryId: string;
  driverId: string;
  userId: string;
  pickupCoordinates: { lat: number; lng: number; address: string };
  dropoffCoordinates: { lat: number; lng: number; address: string };
  distance?: number;
  estimatedDuration?: number;
}

export interface UpdateDeliveryInput {
  status?: DeliveryStatus;
  driverId?: string;
  estimatedDuration?: number;
  actualDuration?: number;
}

export interface DeliveryFilter {
  status?: DeliveryStatus;
  driver?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DeliveryService {
  async create(input: CreateDeliveryInput): Promise<IDelivery> {
    const existing = await Delivery.findOne({ deliveryId: input.deliveryId });
    if (existing) {
      throw new AppError('Delivery with this ID already exists', httpStatus.CONFLICT);
    }
    const delivery = await Delivery.create(input);
    logger.info(`Delivery created: ${delivery.deliveryId}`);
    return delivery;
  }

  async getById(id: string): Promise<IDelivery> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid delivery ID', httpStatus.BAD_REQUEST);
    }
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      throw new AppError('Delivery not found', httpStatus.NOT_FOUND);
    }
    return delivery;
  }

  async list(filters: DeliveryFilter): Promise<PaginatedResult<IDelivery>> {
    const { status, driver, page = 1, limit = 10 } = filters;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (driver) query.driverId = driver;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Delivery.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Delivery.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, input: UpdateDeliveryInput): Promise<IDelivery> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid delivery ID', httpStatus.BAD_REQUEST);
    }
    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true },
    );
    if (!delivery) {
      throw new AppError('Delivery not found', httpStatus.NOT_FOUND);
    }
    logger.info(`Delivery updated: ${delivery.deliveryId}`);
    return delivery;
  }
}

export const deliveryService = new DeliveryService();
