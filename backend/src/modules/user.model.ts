// ========================================
// User Model — пользователи системы
// ========================================

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  password: string;
  displayName: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  permissions: string[];
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  displayName: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  role: { type: String, enum: ['admin', 'manager', 'viewer'], default: 'manager' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password: _, ...rest } = ret;
    return rest;
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
