# MongoDB Compass Setup Guide

MongoDB Compass is a powerful GUI tool for visualizing and managing your MongoDB databases. This guide shows you how to connect Compass to your Local Explorer database.

## Download MongoDB Compass

1. Go to https://www.mongodb.com/try/download/compass
2. Download the version for your operating system
3. Install Compass following the installation wizard

## Connection Methods

### Method 1: Connect to MongoDB Atlas

If you're using MongoDB Atlas (cloud):

1. **Get your connection string from Atlas:**

   - Log into MongoDB Atlas
   - Go to "Database" → "Connect"
   - Choose "Connect using MongoDB Compass"
   - Copy the connection string

2. **Open MongoDB Compass:**

   - Click "New Connection"
   - Paste the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `localexplorer` (optional, you can select it later)

   Example connection string:

   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/localexplorer?retryWrites=true&w=majority
   ```

3. **Click "Connect"**

### Method 2: Connect to Local MongoDB

If you installed MongoDB locally:

1. **Open MongoDB Compass**
2. **Enter connection string:**
   ```
   mongodb://localhost:27017
   ```
3. **Click "Connect"**
4. **Select the `localexplorer` database** from the left sidebar

### Method 3: Connect to Docker MongoDB

If you're using Docker:

1. **Open MongoDB Compass**
2. **Enter connection details:**
   - **Connection String:** `mongodb://localhost:27017`
   - **Authentication:** Fill in:
     - Username: `admin`
     - Password: `admin123`
     - Authentication Database: `admin`
3. **Click "Connect"**
4. **Select the `localexplorer` database** from the left sidebar

## Exploring Your Database

After connecting, you'll see:

### Collections

1. **`users` collection:**

   - Contains user accounts
   - After seeding: 2 demo users (promoter and visitor)
   - Fields: `_id`, `email`, `username`, `role`, `createdAt`, `updatedAt`

2. **`places` collection:**

   - Contains places added by promoters
   - After seeding: 7 sample places
   - Fields include: `name`, `description`, `category`, `address`, `reviews` (embedded), `rooms` (for hotels)

3. **`bookings` collection:**
   - Contains bookings made by visitors
   - Initially empty, populated when users make bookings
   - Fields include: `placeId`, `visitorId`, `promoterId`, `status`, `price`, etc.

### Useful Compass Features

#### Browse Documents

- Click on any collection to view documents
- Use pagination to navigate through large collections
- Click on a document to view/edit in JSON format

#### Filter Documents

- Use the filter bar at the top to query documents
- Example filters:
  ```json
  { "role": "promoter" }
  { "category": "Restaurant" }
  { "status": "pending" }
  ```

#### View Indexes

- Click on "Indexes" tab to see database indexes
- Verify indexes are created: `uploaderId`, `category`, `visitorId`, `promoterId`, `placeId`

#### Schema Analysis

- Click on "Schema" tab to analyze collection structure
- See field types and value distributions

#### Export/Import Data

- Export collections to JSON or CSV
- Import data from files
- Useful for backups and migrations

## Verifying Database Setup

After running `npm run seed`, verify in Compass:

1. **Check `users` collection:**

   - Should have 2 documents
   - One with `role: "promoter"` and email `demo@example.com`
   - One with `role: "visitor"` and email `visitor@example.com`

2. **Check `places` collection:**

   - Should have 7 documents
   - Various categories: Restaurant, Hotel, Cafe, Mountain, Visitable Place
   - Some places have embedded reviews

3. **Check indexes:**
   - Go to Indexes tab
   - Verify indexes exist for performance optimization

## Troubleshooting

### Can't Connect to Local MongoDB

- Make sure MongoDB is running
- Check if port 27017 is accessible
- Verify MongoDB service status:
  - macOS: `brew services list`
  - Linux: `sudo systemctl status mongod`
  - Windows: Check Services panel

### Can't Connect to Docker MongoDB

- Verify Docker container is running: `docker ps`
- Check container logs: `docker-compose logs mongodb`
- Ensure port 27017 is not blocked

### Authentication Failed

- Double-check username and password
- For Docker: Use `admin` / `admin123` with auth database `admin`
- For Atlas: Verify password in connection string matches database user password

### Database Not Visible

- Database `localexplorer` is created automatically when you first insert data
- Run `npm run seed` to create the database and collections
- Refresh Compass if database doesn't appear

## Tips

1. **Bookmark Connections:** Save frequently used connections in Compass
2. **Use Filters:** Quickly find specific documents using the filter bar
3. **Monitor Performance:** Use Compass to monitor query performance
4. **Visualize Relationships:** Explore relationships between collections
5. **Export for Backup:** Regularly export important collections

## Next Steps

After verifying your database in Compass:

1. Start your backend server: `npm run dev`
2. Test API endpoints
3. Create bookings through the API
4. View new bookings in Compass in real-time
