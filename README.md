# Web-Based Attendance System

A complete web-based attendance tracking system built with React, Express.js, and Supabase PostgreSQL.

## Features

- **User Authentication** - JWT-based login system
- **Time Tracking** - Simple time-in and time-out recording
- **8-Hour Calculation** - Automatic calculation of hours worked
- **Attendance Dashboard** - View today's status and attendance history
- **Admin Panel** - View all employees' attendance
- **Real-time Updates** - Live attendance status

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express.js
- TypeScript for type safety
- Prisma ORM for database operations
- JWT for authentication

### Database
- PostgreSQL via Supabase
- Automatic backups and SSL

## Project Structure

```
attendance-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── prisma/
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Node.js v18+
- Docker (optional)
- Supabase account

### Setup Instructions

#### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration:

```sql
-- Users Table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Records Table
CREATE TABLE attendance_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  time_in TIMESTAMP NOT NULL,
  time_out TIMESTAMP,
  hours_worked DECIMAL(5, 2),
  is_completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_time_in ON attendance_records(time_in);
```

#### 2. Backend Setup

```bash
cd backend
cp .env.example .env

# Edit .env with your Supabase credentials
# DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

npm install
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env

# Edit .env with your API URL
# VITE_API_URL=http://localhost:5000

npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Attendance
- `POST /api/attendance/time-in` - Record time-in
- `POST /api/attendance/time-out` - Record time-out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/:employeeId` - Get employee attendance

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
NODE_ENV=development
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Docker Setup

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```

## Deployment

### Frontend - Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend - Render/Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy

## License

MIT
