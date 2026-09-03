import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import queueRoutes from './routes/queueRoutes.js';

dotenv.config();
const app=express();
app.use(cors({origin:process.env.CLIENT_URL || 'http://localhost:5173'}));
app.use(express.json());
app.get('/api/health',(req,res)=>res.json({success:true,message:'Smart Queue API is running'}));
app.use('/api/queue',queueRoutes);

const port=process.env.PORT||5000;
connectDB().then(()=>app.listen(port,()=>console.log(`Server running on http://localhost:${port}`)))
.catch(err=>{console.error(err);process.exit(1);});
