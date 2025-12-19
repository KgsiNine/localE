# Quick Start Guide

## For Users WITHOUT Docker

If you don't have Docker installed, follow these steps:

### Step 1: Choose MongoDB Option

**Recommended: MongoDB Atlas (Cloud) - No Installation Needed**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free M0 cluster
4. Create database user
5. Whitelist your IP (or allow from anywhere for development)
6. Get connection string

**Alternative: Install MongoDB Locally**

- **macOS:** `brew install mongodb-community@7.0`
- **Windows:** Download from https://www.mongodb.com/try/download/community
- **Linux:** Follow instructions in `MONGODB_SETUP.md`

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment

Create `.env` file:

```env
PORT=5001
# Note: Port 5000 is often used by macOS AirPlay Receiver
# If 5001 is also in use, try 3000, 3001, or 8000
# MongoDB Atlas connection string:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/localexplorer?retryWrites=true&w=majority
# OR Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/localexplorer
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Step 4: Initialize Database

```bash
npm run init-db
```

### Step 5: Seed Demo Data (Optional)

```bash
npm run seed
```

This creates:

- Promoter: `demo@example.com` / `demo123`
- Visitor: `visitor@example.com` / `demo123`

### Step 6: Start Server

```bash
npm run dev
```

Server will run on `http://localhost:5001` (or the PORT specified in `.env`)

## Troubleshooting

**Can't connect to MongoDB?**

- Check if MongoDB is running (if local)
- Verify connection string in `.env`
- Check network/firewall settings
- For Atlas: Verify IP is whitelisted

**Port 5001 already in use?**

- Change `PORT` in `.env` file to another port (3000, 3001, 8000, etc.)
- Or stop the application using that port
- **Note:** Port 5000 is often used by macOS AirPlay Receiver, so we use 5001 by default

**Need help?**

- See `MONGODB_SETUP.md` for detailed MongoDB setup
- See `MONGODB_COMPASS.md` for MongoDB Compass GUI setup
- See `SETUP.md` for complete setup guide

## Using MongoDB Compass

MongoDB Compass is a visual tool to explore your database:

1. **Download:** https://www.mongodb.com/try/download/compass
2. **Connect using your connection string:**
   - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/localexplorer`
   - Local: `mongodb://localhost:27017`
   - Docker: `mongodb://admin:admin123@localhost:27017` (with auth)
3. **Explore collections:** users, places, bookings
4. **See `MONGODB_COMPASS.md` for detailed instructions**
