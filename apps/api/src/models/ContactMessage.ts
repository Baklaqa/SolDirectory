import mongoose, { Schema, type Document } from 'mongoose';

/** A message sent from the public Contact page. Kept so a person can be answered even if the notification email failed. */
export interface ContactMessageDoc extends Document {
  name: string;
  email: string;
  phone?: string;
  /** participant or family / provider / worker / other */
  iAm: string;
  message: string;
  ip?: string;
  createdAt: Date;
}

const schema = new Schema<ContactMessageDoc>(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    phone: { type: String, maxlength: 40 },
    iAm: { type: String, required: true, maxlength: 60 },
    message: { type: String, required: true, maxlength: 4000 },
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<ContactMessageDoc>('ContactMessage', schema);
