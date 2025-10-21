import mongoose, { Document, Schema } from 'mongoose';

export type EmailTemplateType =
  | 'welcome'
  | 'ticket_purchase'
  | 'password_reset'
  | 'wallet_recharge'
  | 'withdrawal'
  | 'prize_won'
  | 'lottery_result';

export interface IEmailTemplate extends Document {
  type: EmailTemplateType;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[]; // Variables disponibles como {{userName}}, {{amount}}, etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'welcome',
        'ticket_purchase',
        'password_reset',
        'wallet_recharge',
        'withdrawal',
        'prize_won',
        'lottery_result',
      ],
    },
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
    },
    variables: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
