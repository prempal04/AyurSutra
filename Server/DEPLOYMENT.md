# AyurSutra Backend Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd AyurSutra/Server
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # If using local MongoDB, make sure it's running
   # For MongoDB Atlas, update MONGODB_URI in .env
   ```

4. **Seed Test Data**
   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   npm start
   ```

## Production Deployment

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com/
   - Create new cluster
   - Create database user
   - Add IP whitelist (0.0.0.0/0 for all IPs)

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/ayursutra?retryWrites=true&w=majority
   ```

### Environment Variables for Production

Create `.env` file with production values:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/ayursutra

# JWT Secret (use a strong random string)
JWT_SECRET=your_production_jwt_secret_64_characters_or_more

# Server
PORT=5000
NODE_ENV=production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional: SMS Configuration
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret

# Optional: File Upload Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Deployment Options

#### Option 1: Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create ayursutra-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://..."
   heroku config:set JWT_SECRET="your_secret"
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Seed Production Data**
   ```bash
   heroku run npm run seed
   ```

#### Option 2: Railway Deployment

1. **Connect GitHub Repository**
   - Go to https://railway.app/
   - Connect GitHub repository
   - Select Server folder as root

2. **Set Environment Variables**
   - Add all production environment variables
   - Railway will auto-deploy on git push

#### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect GitHub repository
   - Select Server folder

2. **Configure Build Settings**
   ```yaml
   name: ayursutra-backend
   services:
   - name: api
     source_dir: /Server
     github:
       repo: your-username/AyurSutra
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
   ```

#### Option 4: AWS EC2 Deployment

1. **Create EC2 Instance**
   - Launch Ubuntu 20.04 LTS instance
   - Configure security groups (ports 22, 80, 443, 5000)

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd AyurSutra/Server
   
   # Install dependencies
   npm install --production
   
   # Create .env file with production values
   nano .env
   
   # Start with PM2
   pm2 start server.js --name "ayursutra-backend"
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/ayursutra
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/ayursutra /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Database Migration and Seeding

For production deployment:

```bash
# Seed initial data
npm run seed

# Or run specific seeding commands
node scripts/seedData.js
```

### Monitoring and Logs

#### With PM2
```bash
pm2 status
pm2 logs ayursutra-backend
pm2 restart ayursutra-backend
```

#### Log Files
```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

### Security Checklist

- [ ] Environment variables are properly set
- [ ] JWT secret is strong and secure
- [ ] MongoDB connection is secured
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] Sensitive data is not logged
- [ ] Regular security updates

### Performance Optimization

1. **Enable Compression**
   ```javascript
   app.use(compression());
   ```

2. **Database Indexing**
   - Ensure proper indexes are created
   - Monitor slow queries

3. **Caching**
   - Implement Redis caching for frequent queries
   - Cache API responses where appropriate

4. **Load Balancing**
   - Use multiple server instances
   - Configure load balancer

### Backup Strategy

1. **Database Backup**
   ```bash
   # MongoDB Atlas automatic backups
   # Or manual backup:
   mongodump --uri="mongodb+srv://..."
   ```

2. **Application Backup**
   - Regular git commits
   - Automated deployment scripts

### Troubleshooting

#### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI format
   - Verify IP whitelist in Atlas
   - Check network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

3. **Port Already in Use**
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   # Restart application
   pm2 restart ayursutra-backend
   ```

#### Health Check Endpoint

The API includes a health check endpoint:
```
GET /api/health
```

Use this for monitoring and load balancer health checks.

### API Testing

Once deployed, test the API endpoints:

```bash
# Health check
curl https://your-domain.com/api/health

# Login test
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ayursutra.com","password":"admin123"}'
```

### Frontend Integration

Update your React app's API configuration:

```javascript
// In your React app's .env file
REACT_APP_API_URL=https://your-backend-domain.com/api
```

Make sure CORS is configured to allow your frontend domain in the backend.
