import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function sanitizeUser(u) {
  return {
    _id: u._id, fullName: u.fullName, email: u.email, phoneNumber: u.phoneNumber,
    role: u.role, status: u.status, lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt, approvedAt: u.approvedAt, rejectedAt: u.rejectedAt
  };
}

export async function register(req, res) {
  try {
    const { fullName, email, phoneNumber, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match.' });

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ success: false, message: 'This email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: String(fullName || '').trim(),
      email: normalizedEmail,
      phoneNumber: String(phoneNumber || '').trim(),
      passwordHash,
      role: 'User',
      status: 'Pending'
    });
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is waiting for Admin approval.',
      data: sanitizeUser(user)
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'This email is already registered.' });
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'Pending') {
      return res.status(403).json({ success: false, message: 'Your account is still waiting for Admin approval.' });
    }
    if (user.status === 'Rejected') {
      return res.status(403).json({ success: false, message: 'Your registration request has been rejected. Please contact the administrator.' });
    }
    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    user.lastLoginAt = new Date();
    await user.save();
    const token = signToken(user._id);
    return res.json({ success: true, token, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}

export async function logout(req, res) {
  return res.json({ success: true, message: 'Logged out successfully.' });
}

export async function me(req, res) {
  return res.json({ success: true, data: sanitizeUser(req.user) });
}