import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import queueRoutes from './routes/queueRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Smart Queue API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queue', queueRoutes);

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`Server running on http://localhost:${port}`)))
  .catch(err => { console.error(err); process.exit(1); });
