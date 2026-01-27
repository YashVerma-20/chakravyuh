# CHAKRAVYUH Round 3 - Quick Setup Guide

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies

Since npm is not available in your environment, you'll need to:

**Option A**: Install Node.js first
- Download from: https://nodejs.org/
- Install and restart your terminal
- Then run the commands below

**Option B**: Use an alternative JavaScript runtime
- Install Bun: https://bun.sh/
- Or install Deno: https://deno.land/

### 2. Once npm is available:

```bash
# Backend setup
cd backend
npm install
npm run setup-db    # Creates database schema
npm run seed        # Adds mock data
npm run dev         # Starts backend on port 5000

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev         # Starts frontend on port 5173
```

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 4. Login Credentials

**Judge**:
- Username: `admin`
- Password: `admin123`

**Participant (Teams)**:
- Token: `PHX2026WARRIOR` (or any other team token from README)

## 🔧 Database Setup

If using local PostgreSQL:
```sql
CREATE DATABASE chakravyuh;
```

Or use Supabase:
1. Create project at https://supabase.com
2. Copy connection string
3. Update `backend/.env`

## 📝 Next Steps

1. Replace `assets/intro-video/intro.mp4` with your actual video
2. Test the complete flow (see README.md)
3. Deploy to production (Vercel + Render + Supabase)

## ❓ Troubleshooting

**Port already in use**:
```bash
# Change PORT in backend/.env
# Change port in frontend/vite.config.js
```

**Database connection failed**:
- Check DATABASE_URL in `backend/.env`
- Ensure PostgreSQL is running
- Verify credentials

**Frontend can't reach backend**:
- Check VITE_API_URL in `frontend/.env`
- Ensure backend is running on correct port

## 📚 Full Documentation

See the main [README.md](./README.md) for complete documentation.
