import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod {
  name: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
  icon?: string;
  qrCode?: string;
  isActive: boolean;
}

export interface ISettings extends Document {
  logo?: string;
  logoCollapsed?: string;
  appName: string;
  paymentMethods: IPaymentMethod[];
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    logo: {
      type: String,
    },
    logoCollapsed: {
      type: String,
    },
    appName: {
      type: String,
      default: 'Lotería App',
    },
    paymentMethods: [
      {
        name: { type: String, required: true },
        fields: [
          {
            label: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        icon: { type: String },
        qrCode: { type: String },
        isActive: { type: Boolean, default: true },
      },
    ],
    currency: {
      type: String,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'America/New_York',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
