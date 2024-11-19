// src/models/User.ts

import mongoose, { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/IUser';

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Add other fields as necessary
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

export default mongoose.models.User || model<IUser>('User', UserSchema);
