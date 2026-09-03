# Smart Queue Management System

A full MERN-stack queue management application for a mini hackathon.

## Features
- Join queue with name and service type
- Automatic queue number generation
- Queue status with people ahead and approximate waiting position
- Service types: General Service, Customer Support, Payment, Technical Support
- Input validation
- Dashboard with waiting, serving and completed statistics
- Responsive React UI
- MongoDB persistence
- Realistic seed/sample data
- Admin-style controls to call next and complete a customer

## Requirements
- Node.js 18+
- MongoDB local or MongoDB Atlas

## Setup

### 1. Backend
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

### 2. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

Set `MONGO_URI` in `server/.env`.

## API
- POST /api/queue/join
- GET /api/queue/status/:queueNumber
- GET /api/queue
- GET /api/queue/dashboard
- POST /api/queue/next
- PUT /api/queue/:id/complete
- DELETE /api/queue/reset
