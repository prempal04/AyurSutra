# Database Migration Guide

This guide helps you switch between local MongoDB and MongoDB Atlas, and migrate data between them.

## Quick Start

### 1. Current Setup
Your environment is now configured with:
- ✅ Local MongoDB URL: `mongodb://localhost:27017/ayursutra`
- ✅ Development environment settings
- ✅ Migration scripts ready

### 2. Switch Between Environments

```bash
# Switch to local MongoDB
node scripts/switchEnv.js local

# Switch to Atlas MongoDB
node scripts/switchEnv.js atlas

# Check current configuration
node scripts/switchEnv.js status
```

### 3. Migrate Data from Local to Atlas

#### Step 1: Set up your Atlas URI
Edit the `.env` file and replace the Atlas URI with your actual credentials:
```bash
MONGODB_ATLAS_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/ayursutra?retryWrites=true&w=majority
```

#### Step 2: Run migration
```bash
# Export from local MongoDB
node scripts/migrate.js export

# Import to Atlas (requires Atlas URI in .env)
node scripts/migrate.js full

# Or do it step by step:
node scripts/migrate.js export
node scripts/migrate.js import backups/ayursutra-backup-YYYY-MM-DD.json
```

## Prerequisites

### Local MongoDB
Make sure MongoDB is running locally:
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or if installed differently:
mongod

# Check if running
mongo --eval "db.adminCommand('ismaster')"
```

### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a cluster
3. Get your connection string
4. Add your IP address to the whitelist
5. Create a database user

## Environment Files

### Current .env file structure:
```bash
# Database - Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ayursutra

# JWT Secret
JWT_SECRET=your_development_jwt_secret_at_least_64_characters_long_for_security

# Server
PORT=5001
NODE_ENV=development

# Atlas URI for migration (update with your credentials)
# MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster0.mongodb.net/ayursutra?retryWrites=true&w=majority
```

## Migration Commands

### Export Data
```bash
node scripts/migrate.js export
```
This will:
- Connect to local MongoDB
- Export all collections (users, patients, appointments, etc.)
- Save backup to `backups/ayursutra-backup-timestamp.json`

### Import Data
```bash
node scripts/migrate.js import backups/your-backup-file.json
```
This will:
- Connect to Atlas MongoDB
- Import all data from backup file
- Preserve all relationships and IDs

### Full Migration
```bash
node scripts/migrate.js full
```
This will:
- Export from local
- Import to Atlas
- All in one command

## Testing Your Setup

### 1. Test Local Connection
```bash
# Start your server
npm start

# Check logs for "MongoDB Connected: localhost"
```

### 2. Test Atlas Connection
```bash
# Switch to Atlas
node scripts/switchEnv.js atlas

# Update Atlas URI in .env with your credentials

# Start server
npm start

# Check logs for "MongoDB Connected: your-cluster"
```

## Data Collections

The migration script handles these collections:
- **users** - User accounts and authentication
- **patients** - Patient information
- **appointments** - Scheduled appointments
- **treatments** - Treatment records
- **treatmentplans** - Treatment plan templates
- **healthrecords** - Patient health records

## Troubleshooting

### Common Issues

1. **Connection Refused (Local)**
   ```bash
   # Make sure MongoDB is running
   brew services start mongodb-community
   ```

2. **Authentication Failed (Atlas)**
   - Check username/password in connection string
   - Verify IP whitelist in Atlas dashboard
   - Ensure database user has proper permissions

3. **Network Timeout (Atlas)**
   - Check internet connection
   - Verify firewall settings
   - Try different network if on restricted connection

4. **Data Import Errors**
   - Check for duplicate _id values
   - Verify model schemas match
   - Check for required field validation

### Helpful Commands

```bash
# Check current environment
node scripts/switchEnv.js status

# View available migration options
node scripts/migrate.js

# List backup files
ls -la backups/

# Check MongoDB connection (local)
mongo ayursutra --eval "db.stats()"
```

## Security Notes

- ✅ JWT secret is configured for development
- ✅ Local MongoDB doesn't require authentication by default
- ⚠️ Atlas requires strong passwords and IP whitelisting
- ⚠️ Never commit `.env` file to version control
- ⚠️ Use environment variables in production

## Next Steps

1. **Development**: Use local MongoDB for faster development
2. **Staging**: Use Atlas for testing with production-like data
3. **Production**: Switch to Atlas for deployment
4. **Backup**: Regular exports for data safety

---

**Need Help?**
- Check server logs for connection status
- Verify environment with `node scripts/switchEnv.js status`
- Test migration with sample data first
