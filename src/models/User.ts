import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, UserStatus } from '../interfaces/IUser';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Suspension reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret): any {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

userSchema.virtual('name')
  .get(function () {
    const firstName = this.get('firstName') || '';
    const lastName = this.get('lastName') || '';
    return `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();
  })
  .set(function (name: string) {
    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(' ');

    this.set('firstName', firstName || '');
    this.set('lastName', lastName || '');
  });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for efficient email lookups
userSchema.index({ email: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
export { UserRole, UserStatus };
