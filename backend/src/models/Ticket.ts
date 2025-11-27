import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  ticketNumber: string;
  lotteryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  numbers: number[];
  purchaseDate: Date;
  price: number;
  status: 'active' | 'won' | 'lost' | 'refunded' | 'cancelled';
  isVerified: boolean;
  verificationCode: string;
  matchedNumbers?: number;
  prize?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    lotteryId: {
      type: Schema.Types.ObjectId,
      ref: 'Lottery',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    numbers: {
      type: [Number],
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'won', 'lost', 'refunded', 'cancelled'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
    matchedNumbers: {
      type: Number,
      min: 0,
    },
    prize: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TicketSchema.index({ userId: 1, lotteryId: 1 });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
