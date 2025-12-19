# Troubleshooting Guide

## Port Already in Use

### Port 5000 Already in Use (macOS)

**Problem:** Error `EADDRINUSE: address already in use :::5000`

**Cause:** macOS AirPlay Receiver uses port 5000 by default.

**Solution:** The default port is now set to 5001 in `.env` to avoid this conflict. If you still see this error:

1. Make sure your `.env` file has `PORT=5001`
2. If 5001 is also in use, try another port: `3000`, `3001`, `8000`, `8080`

**Alternative:** Disable AirPlay Receiver (if you don't need it):

1. System Settings → General → AirDrop & Handoff
2. Turn off "AirPlay Receiver"

### Port 5001 Already in Use

If port 5001 is also in use, change to another port in your `.env`:

```env
PORT=3000
# Or try: 3001, 8000, 8080
```

Then restart your server:

```bash
npm run dev
```

## MongoDB Connection Issues

### Connection Refused

- Make sure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB service: `brew services list` (macOS)

### Authentication Failed

- **Atlas:** Verify username/password in connection string
- **Docker:** Use `mongodb://admin:admin123@localhost:27017/localexplorer?authSource=admin`
- **Local:** Use `mongodb://localhost:27017/localexplorer` (no auth)

### Can't Find Database

- Database is created automatically when you first insert data
- Run `npm run seed` to create database and collections

## TypeScript Errors

### Unused Import Warnings

- These are warnings, not errors
- Can be ignored or fixed by removing unused imports
- Example: `import mongoose` → `import { Schema }` if only Schema is used

## Other Common Issues

### Module Not Found

```bash
npm install
```

### Permission Denied

```bash
chmod +x scripts/*.sh
```

### Port Already in Use (General)

```bash
# Find process
lsof -ti:PORT_NUMBER

# Kill process
kill -9 PID

# Or kill all node processes
pkill -9 node
```
