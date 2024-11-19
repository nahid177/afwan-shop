// src/interfaces/IUser.ts

import { Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
