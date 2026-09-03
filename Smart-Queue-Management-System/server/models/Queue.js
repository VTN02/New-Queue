import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  queueNumber: { type: Number, required: true, unique: true },
  serviceType: {
    type: String,
    required: true,
    enum: ['General Service', 'Customer Support', 'Payment', 'Technical Support']
  },
  status: { type: String, enum: ['waiting', 'serving', 'completed'], default: 'waiting' },
  joinedAt: { type: Date, default: Date.now },
  servedAt: Date,
  completedAt: Date
}, { timestamps: true });

export default mongoose.model('Queue', queueSchema);
