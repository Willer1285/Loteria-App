import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'prize_won' | 'deposit_approved' | 'deposit_rejected' | 'withdrawal_approved' | 'withdrawal_rejected' | 'profile_updated' | 'ranking_up' | 'ranking_down';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: mongoose.Types.ObjectId; // ID del pago, sorteo, etc. relacionado
  metadata?: {
    amount?: number;
    previousPosition?: number;
    currentPosition?: number;
    prizeName?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'prize_won',
        'deposit_approved',
        'deposit_rejected',
        'withdrawal_approved',
        'withdrawal_rejected',
        'profile_updated',
        'ranking_up',
        'ranking_down',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas eficientes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
