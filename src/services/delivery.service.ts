import { Types } from 'mongoose';
import httpStatus from 'http-status-codes';
import Delivery, { IDelivery } from '../models/Delivery';
import { AppError } from '../utils/AppError';
import logger from '../config/logger';

export type DeliveryStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateDeliveryInput {
  trackingNumber?: string;
  deliveryId?: string;
  driverId?: string;
  userId?: string;
  customer?: { name: string; phone: string; email?: string };
  pickup?: { address: string; city?: string; state?: string; zipCode?: string; instructions?: string };
  dropoff?: { address: string; city?: string; state?: string; zipCode?: string };
  package?: { description?: string; weight?: number; size?: string; isFragile?: boolean; requiresSignature?: boolean };
  pickupCoordinates?: { lat: number; lng: number; address: string };
  dropoffCoordinates?: { lat: number; lng: number; address: string };
  deliveryFee?: number;
  escrowAmount?: number;
  notes?: string;
  distance?: number;
  estimatedDuration?: number;
}

export interface UpdateDeliveryInput {
  status?: DeliveryStatus;
  driverId?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
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
    const trackingId = input.trackingNumber || input.deliveryId;
    if (trackingId) {
      const existing = await Delivery.findOne({
        $or: [{ trackingNumber: trackingId }, { deliveryId: trackingId }],
      });
      if (existing) {
        throw new AppError('Delivery with this tracking number already exists', httpStatus.CONFLICT);
      }
    }
    const delivery = await Delivery.create(input);
    logger.info(`Delivery created: ${delivery.trackingNumber || delivery.deliveryId}`);
    return delivery;
  }

  async getById(id: string): Promise<IDelivery> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid delivery ID', httpStatus.BAD_REQUEST);
    }
    const delivery = await Delivery.findOne({ _id: id, isDeleted: false });
    if (!delivery) throw new AppError('Delivery not found', httpStatus.NOT_FOUND);
    return delivery;
  }

  async list(filters: DeliveryFilter): Promise<PaginatedResult<IDelivery>> {
    const { status, driver, search, page = 1, limit = 10 } = filters;
    const query: Record<string, unknown> = { isDeleted: false };
    if (status) query.status = status;
    if (driver) query.driverId = driver;
    if (search) {
      query.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
      ];
    }
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
      id, { $set: input }, { new: true, runValidators: true },
    );
    if (!delivery) throw new AppError('Delivery not found', httpStatus.NOT_FOUND);
    logger.info(`Delivery updated: ${delivery.trackingNumber || delivery.deliveryId}`);
    return delivery;
  }

  async archive(id: string, userId?: string): Promise<IDelivery> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid delivery ID', httpStatus.BAD_REQUEST);
    }
    const delivery = await Delivery.findById(id);
    if (!delivery) throw new AppError('Delivery not found', httpStatus.NOT_FOUND);
    if (delivery.isDeleted) throw new AppError('Delivery is already archived', httpStatus.CONFLICT);
    return delivery.softDelete(userId);
  }

  async restore(id: string): Promise<IDelivery> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid delivery ID', httpStatus.BAD_REQUEST);
    }
    const delivery = await Delivery.findById(id);
    if (!delivery) throw new AppError('Delivery not found', httpStatus.NOT_FOUND);
    if (!delivery.isDeleted) throw new AppError('Delivery is not archived', httpStatus.CONFLICT);
    return delivery.restore();
  }

  async listArchived(page = 1, limit = 10): Promise<PaginatedResult<IDelivery>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Delivery.find({ isDeleted: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Delivery.countDocuments({ isDeleted: true }).exec(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const deliveryService = new DeliveryService();
