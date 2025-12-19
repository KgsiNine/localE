# Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)

## Quick Start

1. **Navigate to the backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create a `.env` file:**

```bash
cp .env.example .env
```

Or manually create `.env` with:

```env
PORT=5001
# Note: Port 5000 is often used by macOS AirPlay Receiver
# If 5001 is also in use, try 3000, 3001, or 8000
# Choose ONE based on your MongoDB setup:
# MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/localexplorer?retryWrites=true&w=majority
# Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/localexplorer
# Docker MongoDB:
# MONGODB_URI=mongodb://admin:admin123@localhost:27017/localexplorer?authSource=admin
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

4. **Set up MongoDB (Choose ONE option):**

**Option A: MongoDB Atlas (Cloud - Easiest, No Installation Required) ⭐ Recommended**

- Create free account at https://www.mongodb.com/cloud/atlas
- Create a free cluster (M0 tier)
- Create database user and whitelist your IP
- Get connection string and add to `.env`
- **No local installation needed!**
- See `MONGODB_SETUP.md` for detailed Atlas setup

**📖 For detailed instructions on all options, see `MONGODB_SETUP.md`**

**💡 Tip:** Use MongoDB Compass (GUI tool) to visually explore your database. See `MONGODB_COMPASS.md` for setup instructions.

5. **Initialize and seed the database:**

```bash
# Initialize database (creates indexes)
npm run init-db

# Seed with demo data (optional but recommended)
npm run seed
```

This creates demo accounts:

- Promoter: `demo@example.com` / `demo123`
- Visitor: `visitor@example.com` / `demo123`

6. **Start the server:**

```bash
# Development mode (with auto-reload using ts-node-dev)
npm run dev

# Production mode (builds TypeScript first, then runs)
npm run build
npm start
```

The server will run on `http://localhost:5001` (or the PORT specified in `.env`).

## API Base URL

All API endpoints are prefixed with `/api`:

- Base URL: `http://localhost:5001/api`

## Testing the API

You can test the health endpoint:

```bash
curl http://localhost:5001/api/health
```

## Connecting Frontend

Update your frontend API calls to point to:

```
http://localhost:5001/api
```

(Or use the PORT specified in your `.env` file)

Make sure to include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```
