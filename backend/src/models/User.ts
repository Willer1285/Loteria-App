import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'gerente' | 'jugador';
  balance: number;
  isActive: boolean;
  isBanned: boolean;
  bannedReason?: string;
  bannedAt?: Date;
  avatar?: string;
  phone?: string;
  address?: string;
  totalSpent: number;
  totalWon: number;
  ticketsPurchased: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Permisos para gerente
  permissions?: {
    canManageLotteries: boolean;
    canManageUsers: boolean;
    canManagePayments: boolean;
    canManageTickets: boolean;
    canManageEmails: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'gerente', 'jugador'],
      default: 'jugador',
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bannedReason: {
      type: String,
    },
    bannedAt: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWon: {
      type: Number,
      default: 0,
      min: 0,
    },
    ticketsPurchased: {
      type: Number,
      default: 0,
      min: 0,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    permissions: {
      type: {
        canManageLotteries: { type: Boolean, default: false },
        canManageUsers: { type: Boolean, default: false },
        canManagePayments: { type: Boolean, default: false },
        canManageTickets: { type: Boolean, default: false },
        canManageEmails: { type: Boolean, default: false },
        canManageSettings: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: false },
      },
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
