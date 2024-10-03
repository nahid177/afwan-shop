import mongoose, { Schema, Document } from 'mongoose';

// Interface for Admin User
interface IAdminUser extends Document {
  username: string; // Admin's username
  password: string; // Hashed password
  devices: string[]; // Array of registered device IDs (maximum 2)
  createdAt?: Date;
  updatedAt?: Date;
}

// Admin User schema
const AdminUserSchema: Schema = new Schema<IAdminUser>({
  username: { type: String, required: true, unique: true }, // Username must be unique
  password: { type: String, required: true }, // Password (hashed)
  devices: { type: [String], default: [], maxlength: 2 }, // Array of device IDs (max length 2)
}, { timestamps: true });

// Create the Admin User model
const AdminUser = mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
export default AdminUser;
