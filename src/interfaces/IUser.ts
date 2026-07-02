import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  status: UserStatus;
  suspendedAt?: Date;
  suspendedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  token: string;
}
