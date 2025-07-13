# 🚀 Deployment Guide - Cybersecurity Threat Detection System

This guide covers deploying your MERN stack application to various production platforms.

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- Git repository with your code
- MongoDB Atlas account (for database)
- Platform-specific accounts (Render, Vercel, Railway, etc.)

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (M0 Free tier)

2. **Configure Database**
   - Create a database user with read/write permissions
   - Get your connection string
   - Whitelist your IP addresses (or 0.0.0.0/0 for all)

3. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/cybersecurity-threats?retryWrites=true&w=majority
   ```

## 🌐 Platform Deployment Options

### Option 1: Render (Recommended - Free Tier)

**Backend API:**
1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Configure:
   - **Name**: `cybersecurity-threat-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secret_jwt_key
     JWT_EXPIRES_IN=24h
     CLIENT_URL=https://your-frontend-url.onrender.com
     ```

**Frontend Dashboard:**
1. Create a new Static Site
2. Configure:
   - **Name**: `cybersecurity-threat-dashboard`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com/api
     ```

### Option 2: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-backend-url.railway.app/api
     ```

**Backend (Railway):**
1. Go to [Railway](https://railway.app)
2. Deploy from GitHub
3. Configure:
   - **Root Directory**: `server`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secret_jwt_key
     JWT_EXPIRES_IN=24h
     CLIENT_URL=https://your-frontend-url.vercel.app
     ```

### Option 3: Docker Deployment

**Local Docker:**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t cybersecurity-api .
docker build -t cybersecurity-client ./client
```

**Docker Hub:**
1. Build and push images:
   ```bash
   docker build -t yourusername/cybersecurity-api .
   docker build -t yourusername/cybersecurity-client ./client
   docker push yourusername/cybersecurity-api
   docker push yourusername/cybersecurity-client
   ```

2. Deploy to any platform supporting Docker

### Option 4: Heroku

**Backend:**
1. Create Heroku app
2. Add MongoDB add-on
3. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_key
   git push heroku main
   ```

**Frontend:**
1. Create separate Heroku app
2. Use buildpack: `heroku/nodejs`
3. Configure environment variables

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybersecurity-threats
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
CLIENT_URL=https://your-frontend-domain.com

# Optional: Email/Slack notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 🚀 Quick Deploy Commands

### Render (Using render.yaml)
```bash
# Install Render CLI
npm install -g @render/cli

# Deploy both services
render deploy
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel --prod
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd server
railway login
railway init
railway up
```

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Regular security updates
- [ ] Database backups
- [ ] Environment variable security

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `GET /api/health`
- Frontend: Built-in React error boundaries

### Logs
- Monitor application logs
- Set up error tracking (Sentry, LogRocket)
- Database performance monitoring

### Updates
- Regular dependency updates
- Security patches
- Feature updates

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CLIENT_URL environment variable
2. **Database Connection**: Verify MONGODB_URI format
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required vars are set

### Support:
- Check platform-specific documentation
- Review application logs
- Test locally with production environment variables

## 🎯 Next Steps

1. **Set up CI/CD pipeline**
2. **Add monitoring and alerting**
3. **Implement backup strategies**
4. **Set up staging environment**
5. **Add performance optimization**

---

**Need Help?** Check the platform-specific documentation or create an issue in the repository. 