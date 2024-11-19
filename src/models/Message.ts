// src/models/Message.ts

import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  sender: 'User' | 'Admin';
  senderName?: string;
  userId: mongoose.Types.ObjectId;
  message?: string; // Made optional
  imageUrl?: string;
  status: 'sent' | 'seen';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: { type: String, enum: ['User', 'Admin'], required: true },
  senderName: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String }, // Removed 'required: true'
  imageUrl: { type: String },
  status: { type: String, enum: ['sent', 'seen'], default: 'sent' },
}, { timestamps: true });

// Custom validation to ensure at least one of 'message' or 'imageUrl' is present
MessageSchema.pre<IMessage>('validate', function (next) {
  if (!this.message && !this.imageUrl) {
    this.invalidate('message', 'Either message or imageUrl is required.');
    this.invalidate('imageUrl', 'Either message or imageUrl is required.');
  }
  next();
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
