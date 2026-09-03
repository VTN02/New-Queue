import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Queue from './models/Queue.js';
dotenv.config();

const sample=[
['Arun Kumar','General Service','completed'],
['Nivetha S','Customer Support','completed'],
['Dinesh R','Payment','serving'],
['Fathima A','Technical Support','waiting'],
['Kavin J','General Service','waiting'],
['Sanjana P','Customer Support','waiting'],
['Mohamed R','Payment','waiting'],
['Tharushi K','Technical Support','waiting']
];

await connectDB();
await Queue.deleteMany({});
await Queue.insertMany(sample.map((x,i)=>({name:x[0],serviceType:x[1],status:x[2],queueNumber:i+1,joinedAt:new Date(Date.now()-(sample.length-i)*600000)})));
console.log('Sample queue data inserted.');
process.exit(0);
