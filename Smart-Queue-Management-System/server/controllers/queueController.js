import Queue from '../models/Queue.js';

const SERVICES = ['General Service', 'Customer Support', 'Payment', 'Technical Support'];

export async function joinQueue(req, res) {
  try {
    const { name, serviceType } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success:false, message:'Name is required.' });
    if (name.trim().length < 2) return res.status(400).json({ success:false, message:'Name must contain at least 2 characters.' });
    if (!SERVICES.includes(serviceType)) return res.status(400).json({ success:false, message:'Please select a valid service.' });

    const latest = await Queue.findOne().sort({ queueNumber: -1 });
    const queueNumber = (latest?.queueNumber || 0) + 1;

    const item = await Queue.create({ name: name.trim(), serviceType, queueNumber });
    res.status(201).json({ success:true, data:item });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
}

export async function getQueue(req, res) {
  try {
    const items = await Queue.find().sort({ queueNumber: 1 });
    res.json({ success:true, data:items });
  } catch (error) { res.status(500).json({ success:false, message:error.message }); }
}

export async function getStatus(req, res) {
  try {
    const num = Number(req.params.queueNumber);
    if (!Number.isInteger(num)) return res.status(400).json({ success:false, message:'Invalid queue number.' });

    const user = await Queue.findOne({ queueNumber:num });
    if (!user) return res.status(404).json({ success:false, message:'Queue number not found.' });

    const serving = await Queue.findOne({ status:'serving' }).sort({ queueNumber:1 });
    const ahead = await Queue.countDocuments({ status:'waiting', queueNumber:{ $lt:num } });
    const waiting = await Queue.countDocuments({ status:'waiting' });

    res.json({
      success:true,
      data:{
        user,
        currentlyServing: serving?.queueNumber || null,
        peopleAhead: user.status === 'waiting' ? ahead : 0,
        approximateMinutes: user.status === 'waiting' ? ahead * 5 : 0,
        totalWaiting: waiting
      }
    });
  } catch (error) { res.status(500).json({ success:false, message:error.message }); }
}

export async function dashboard(req, res) {
  try {
    const [waiting, serving, completed, total] = await Promise.all([
      Queue.countDocuments({status:'waiting'}),
      Queue.countDocuments({status:'serving'}),
      Queue.countDocuments({status:'completed'}),
      Queue.countDocuments()
    ]);
    const services = await Queue.aggregate([
      {$group:{_id:'$serviceType', count:{$sum:1}}},
      {$sort:{count:-1}}
    ]);
    res.json({success:true, data:{waiting, serving, completed, total, services}});
  } catch (error) { res.status(500).json({success:false,message:error.message}); }
}

export async function nextCustomer(req,res) {
  try {
    const active = await Queue.findOne({status:'serving'});
    if (active) return res.status(409).json({success:false,message:`Queue #${active.queueNumber} is currently serving.`});
    const next = await Queue.findOne({status:'waiting'}).sort({queueNumber:1});
    if (!next) return res.status(404).json({success:false,message:'No waiting customers.'});
    next.status='serving'; next.servedAt=new Date(); await next.save();
    res.json({success:true,data:next});
  } catch(error){res.status(500).json({success:false,message:error.message});}
}

export async function completeCustomer(req,res) {
  try {
    const item=await Queue.findById(req.params.id);
    if(!item) return res.status(404).json({success:false,message:'Customer not found.'});
    item.status='completed'; item.completedAt=new Date(); await item.save();
    res.json({success:true,data:item});
  } catch(error){res.status(500).json({success:false,message:error.message});}
}

export async function resetQueue(req,res) {
  try { await Queue.deleteMany({}); res.json({success:true,message:'Queue reset.'}); }
  catch(error){res.status(500).json({success:false,message:error.message});}
}
