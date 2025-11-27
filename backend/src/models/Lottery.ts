import mongoose, { Document, Schema } from 'mongoose';

export interface ILottery extends Document {
  controlNumber: string; // Número de control único del sorteo (generado automáticamente)
  name: string; // Nombre del sorteo
  lotteryName: string; // Nombre de la lotería
  description: string;
  image?: string; // Imagen del sorteo
  ticketPrice: number;
  totalPrize: number;
  drawDate: Date;
  status: 'upcoming' | 'active' | 'drawing' | 'completed' | 'cancelled' | 'pending_draw';
  maxTickets: number; // Cantidad total de boletos/números
  soldTickets: number;
  maxTicketsPerPlayer: number; // Máximo de boletos que puede comprar un jugador (0 = sin límite)
  winningNumbers?: number[];
  winners?: {
    userId: mongoose.Types.ObjectId;
    ticketId: mongoose.Types.ObjectId;
    prize: number;
    position: number;
  }[];
  prizes: {
    name: string; // Ej: "1er Lugar", "2do Lugar"
    type: 'cash' | 'physical'; // Tipo de premio: dinero o físico
    amount: number; // Monto en dinero o valor equivalente
    description?: string; // Descripción del premio físico (ej: "Toyota Corolla 2024")
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
  selectionType: 'manual' | 'random' | 'both'; // Tipo de selección de números
  randomButtons: number[]; // Botones de selección al azar [5, 10, 50]
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
    lotteryName: {
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
      enum: ['upcoming', 'active', 'drawing', 'completed', 'cancelled', 'pending_draw'],
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
    maxTicketsPerPlayer: {
      type: Number,
      required: true,
      default: 0, // 0 = sin límite
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
    prizes: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['cash', 'physical'],
          default: 'cash',
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        description: {
          type: String,
        },
        position: {
          type: Number,
          required: true,
        },
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
    selectionType: {
      type: String,
      enum: ['manual', 'random', 'both'],
      required: true,
      default: 'both',
    },
    randomButtons: {
      type: [Number],
      default: [5, 10, 50],
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
