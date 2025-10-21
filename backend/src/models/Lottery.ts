import mongoose, { Document, Schema } from 'mongoose';

export interface ILottery extends Document {
  controlNumber: string; // Número de control único del sorteo
  name: string;
  description: string;
  image?: string; // Imagen del sorteo
  ticketPrice: number;
  totalPrize: number;
  drawDate: Date;
  status: 'upcoming' | 'active' | 'drawing' | 'completed' | 'cancelled';
  maxTickets: number;
  soldTickets: number;
  winningNumbers?: number[];
  winners?: {
    userId: mongoose.Types.ObjectId;
    ticketId: mongoose.Types.ObjectId;
    prize: number;
    position: number;
  }[];
  prizeDistribution: {
    position: number;
    percentage: number;
    amount: number;
  }[];
  numbersRange: {
    min: number;
    max: number;
    count: number;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LotterySchema = new Schema<ILottery>(
  {
    controlNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrize: {
      type: Number,
      required: true,
      min: 0,
    },
    drawDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'drawing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    maxTickets: {
      type: Number,
      required: true,
      min: 1,
    },
    soldTickets: {
      type: Number,
      default: 0,
      min: 0,
    },
    winningNumbers: {
      type: [Number],
    },
    winners: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        ticketId: {
          type: Schema.Types.ObjectId,
          ref: 'Ticket',
        },
        prize: Number,
        position: Number,
      },
    ],
    prizeDistribution: [
      {
        position: Number,
        percentage: Number,
        amount: Number,
      },
    ],
    numbersRange: {
      min: {
        type: Number,
        required: true,
        default: 1,
      },
      max: {
        type: Number,
        required: true,
        default: 50,
      },
      count: {
        type: Number,
        required: true,
        default: 6,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILottery>('Lottery', LotterySchema);
