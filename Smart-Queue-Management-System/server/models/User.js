import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: {
    type: String, required: true, unique: true, trim: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
  },
  phoneNumber: {
    type: String, required: true, trim: true,
    match: [/^\+?[0-9\s\-()]{7,15}$/, 'Please provide a valid phone number.']
  },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Inactive'], default: 'Pending' },
  lastLoginAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('User', userSchema);