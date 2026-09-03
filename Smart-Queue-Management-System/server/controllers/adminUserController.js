import User from '../models/User.js';
import Queue from '../models/Queue.js';

function sanitizeUser(u) {
  return {
    _id: u._id, fullName: u.fullName, email: u.email, phoneNumber: u.phoneNumber,
    role: u.role, status: u.status, lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt, approvedAt: u.approvedAt, rejectedAt: u.rejectedAt,
    rejectionReason: u.rejectionReason
  };
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listUsers(req, res) {
  try {
    const { search = '', status = '', role = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
      const re = new RegExp(escapeRegex(String(search)), 'i');
      filter.$or = [{ fullName: re }, { email: re }, { phoneNumber: re }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: users.map(sanitizeUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load users.' });
  }
}

export async function listPending(req, res) {
  try {
    const users = await User.find({ status: 'Pending' }).sort({ createdAt: -1 });
    return res.json({ success: true, data: users.map(sanitizeUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load pending users.' });
  }
}

async function findTarget(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return null;
  }
  if (user._id.equals(req.user._id)) {
    res.status(400).json({ success: false, message: 'You cannot perform this action on your own account.' });
    return null;
  }
  return user;
}

export async function approveUser(req, res) {
  try {
    const target = await findTarget(req, res);
    if (!target) return;
    target.status = 'Approved';
    target.approvedAt = new Date();
    target.rejectedAt = undefined;
    target.rejectionReason = undefined;
    await target.save();
    return res.json({ success: true, message: `${target.fullName} has been approved.`, data: sanitizeUser(target) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not approve user.' });
  }
}

export async function rejectUser(req, res) {
  try {
    const target = await findTarget(req, res);
    if (!target) return;
    target.status = 'Rejected';
    target.rejectedAt = new Date();
    target.rejectionReason = String(req.body?.reason || '').trim() || null;
    target.approvedAt = undefined;
    await target.save();
    return res.json({ success: true, message: `${target.fullName} was rejected.`, data: sanitizeUser(target) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not reject user.' });
  }
}

export async function deactivateUser(req, res) {
  try {
    const target = await findTarget(req, res);
    if (!target) return;
    target.status = 'Inactive';
    await target.save();
    return res.json({ success: true, message: `${target.fullName} was deactivated.`, data: sanitizeUser(target) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not deactivate user.' });
  }
}

export async function deleteUser(req, res) {
  try {
    const target = await findTarget(req, res);
    if (!target) return;
    await User.deleteOne({ _id: target._id });
    return res.json({ success: true, message: `${target.fullName} was permanently deleted.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not delete user.' });
  }
}

export async function getStats(req, res) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [
      totalUsers, pending, approved, rejected, inactive,
      waiting, serving, completed, completedToday, totalQueues
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: 'Pending' }),
      User.countDocuments({ status: 'Approved' }),
      User.countDocuments({ status: 'Rejected' }),
      User.countDocuments({ status: 'Inactive' }),
      Queue.countDocuments({ status: 'waiting' }),
      Queue.countDocuments({ status: 'serving' }),
      Queue.countDocuments({ status: 'completed' }),
      Queue.countDocuments({ status: 'completed', completedAt: { $gte: startOfDay } }),
      Queue.countDocuments({})
    ]);
    const services = await Queue.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return res.json({ success: true, data: { totalUsers, pending, approved, rejected, inactive, waiting, serving, completed, completedToday, totalQueues, services } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load statistics.' });
  }
}