import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'ticket_purchase' | 'prize_payout' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'wallet' | 'cash';
  transactionId?: string;
  ticketId?: mongoose.Types.ObjectId;
  lotteryId?: mongoose.Types.ObjectId;
  description: string;
  proofOfPayment?: string; // URL de la imagen del comprobante
  metadata?: {
    cardLast4?: string;
    bankName?: string;
    [key: string]: any;
  };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'ticket_purchase', 'prize_payout', 'refund'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'wallet', 'cash'],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    lotteryId: {
      type: Schema.Types.ObjectId,
      ref: 'Lottery',
    },
    description: {
      type: String,
      required: true,
    },
    proofOfPayment: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PaymentSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
