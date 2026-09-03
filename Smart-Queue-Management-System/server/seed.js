import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import Queue from './models/Queue.js';
import User from './models/User.js';
dotenv.config();

const sample = [
  ['Arun Kumar', 'General Service', 'completed'],
  ['Nivetha S', 'Customer Support', 'completed'],
  ['Dinesh R', 'Payment', 'serving'],
  ['Fathima A', 'Technical Support', 'waiting'],
  ['Kavin J', 'General Service', 'waiting'],
  ['Sanjana P', 'Customer Support', 'waiting'],
  ['Mohamed R', 'Payment', 'waiting'],
  ['Tharushi K', 'Technical Support', 'waiting']
];

await connectDB();

await Queue.deleteMany({});
await Queue.insertMany(sample.map((x, i) => ({
  name: x[0], serviceType: x[1], status: x[2], queueNumber: i + 1,
  joinedAt: new Date(Date.now() - (sample.length - i) * 600000)
})));

const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@queueflow.com').trim().toLowerCase();
const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';

const existingAdmin = await User.findOne({ email: adminEmail });
if (existingAdmin) {
  existingAdmin.role = 'Admin';
  existingAdmin.status = 'Approved';
  await existingAdmin.save();
  console.log(`Admin ensured: ${adminEmail}`);
} else {
  await User.create({
    fullName: 'Admin',
    email: adminEmail,
    phoneNumber: '0000000000',
    passwordHash: await bcrypt.hash(adminPassword, 10),
    role: 'Admin',
    status: 'Approved'
  });
  console.log(`Default admin created: ${adminEmail} / ${adminPassword}`);
}

console.log('Sample queue data inserted.');
process.exit(0);
