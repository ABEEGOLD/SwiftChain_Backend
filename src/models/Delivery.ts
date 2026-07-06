import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDelivery extends Document {
  trackingNumber?: string;
  deliveryId?: string;
  driverId?: string;
  userId?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  pickup?: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    instructions?: string;
  };
  dropoff?: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  package?: {
    description?: string;
    weight?: number;
    size?: string;
    isFragile?: boolean;
    requiresSignature?: boolean;
  };
  pickupCoordinates?: { lat: number; lng: number; address: string };
  dropoffCoordinates?: { lat: number; lng: number; address: string };
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  deliveryFee?: number;
  escrowAmount?: number;
  notes?: string;
  distance?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  softDelete(userId?: string): Promise<IDelivery>;
  restore(): Promise<IDelivery>;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    trackingNumber: { type: String },
    deliveryId: { type: String },
    driverId: { type: String },
    userId: { type: String },
    customer: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    pickup: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      instructions: { type: String },
    },
    dropoff: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
    package: {
      description: { type: String },
      weight: { type: Number },
      size: { type: String },
      isFragile: { type: Boolean },
      requiresSignature: { type: Boolean },
    },
    pickupCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    dropoffCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'Pending', 'assigned', 'Assigned', 'in_progress', 'completed', 'cancelled', 'picked_up', 'in_transit', 'delivered'],
      default: 'pending',
    },
    deliveryFee: { type: Number },
    escrowAmount: { type: Number },
    notes: { type: String },
    distance: { type: Number },
    estimatedDuration: { type: Number },
    actualDuration: { type: Number },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

DeliverySchema.methods.softDelete = async function (userId?: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

DeliverySchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

export const Delivery = (mongoose.models.Delivery ||
  mongoose.model<IDelivery>('Delivery', DeliverySchema)) as Model<IDelivery>;

export default Delivery;
