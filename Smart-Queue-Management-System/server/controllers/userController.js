import Queue from '../models/Queue.js';

function sanitizeUser(u) {
  return {
    _id: u._id, fullName: u.fullName, email: u.email, phoneNumber: u.phoneNumber,
    role: u.role, status: u.status, lastLoginAt: u.lastLoginAt, createdAt: u.createdAt
  };
}

export async function getProfile(req, res) {
  return res.json({ success: true, data: sanitizeUser(req.user) });
}

export async function updateProfile(req, res) {
  try {
    const { fullName, phoneNumber } = req.body;
    if (fullName !== undefined) {
      const name = String(fullName || '').trim();
      if (name.length < 2) return res.status(400).json({ success: false, message: 'Full name must contain at least 2 characters.' });
      req.user.fullName = name;
    }
    if (phoneNumber !== undefined) {
      const phone = String(phoneNumber || '').trim();
      if (!/^\+?[0-9\s\-()]{7,15}$/.test(phone)) return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
      req.user.phoneNumber = phone;
    }
    await req.user.save();
    return res.json({ success: true, message: 'Profile updated successfully.', data: sanitizeUser(req.user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not update profile.' });
  }
}

export async function getDashboard(req, res) {
  try {
    const activeQueue = await Queue.findOne({ user: req.user._id, status: { $in: ['waiting', 'serving'] } }).sort({ queueNumber: -1 });
    const [completedCount, totalCount] = await Promise.all([
      Queue.countDocuments({ user: req.user._id, status: 'completed' }),
      Queue.countDocuments({ user: req.user._id })
    ]);

    let currentQueue = null;
    if (activeQueue) {
      const serving = await Queue.findOne({ status: 'serving' }).sort({ queueNumber: 1 });
      const ahead = await Queue.countDocuments({ status: 'waiting', queueNumber: { $lt: activeQueue.queueNumber } });
      const isWaiting = activeQueue.status === 'waiting';
      currentQueue = {
        queueNumber: activeQueue.queueNumber,
        serviceType: activeQueue.serviceType,
        status: activeQueue.status,
        joinedAt: activeQueue.joinedAt,
        currentlyServing: serving?.queueNumber ?? null,
        position: isWaiting ? ahead + 1 : 0,
        peopleAhead: isWaiting ? ahead : 0,
        approximateMinutes: isWaiting ? ahead * 5 : 0
      };
    }

    return res.json({
      success: true,
      data: { fullName: req.user.fullName, completedCount, totalCount, currentQueue }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load dashboard.' });
  }
}

export async function getQueueHistory(req, res) {
  try {
    const items = await Queue.find({ user: req.user._id }).sort({ joinedAt: -1 });
    return res.json({
      success: true,
      data: items.map((i) => ({
        _id: i._id, queueNumber: i.queueNumber, serviceType: i.serviceType,
        status: i.status, joinedAt: i.joinedAt, servedAt: i.servedAt, completedAt: i.completedAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load queue history.' });
  }
}